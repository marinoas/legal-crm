const stripe = require('stripe');
const axios = require('axios');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.providers = {
      stripe: null,
      viva: null
    };
    this.initialized = false;
  }

  async initialize(settings) {
    try {
      // Initialize Stripe
      if (settings?.stripe?.enabled && settings.stripe.secretKey) {
        this.providers.stripe = stripe(settings.stripe.secretKey);
        console.log('✓ Stripe payment provider initialized');
      }

      // Initialize Viva Wallet
      if (settings?.viva?.enabled && settings.viva.merchantId) {
        this.providers.viva = {
          merchantId: settings.viva.merchantId,
          apiKey: settings.viva.apiKey,
          clientId: settings.viva.clientId,
          clientSecret: settings.viva.clientSecret,
          environment: settings.viva.environment || 'demo'
        };
        console.log('✓ Viva Wallet payment provider initialized');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Payment service initialization error:', error);
      throw error;
    }
  }

  // Stripe Methods
  async createStripeCustomer(clientData) {
    if (!this.providers.stripe) {
      throw new Error('Stripe is not configured');
    }

    const customer = await this.providers.stripe.customers.create({
      email: clientData.email,
      name: clientData.companyName || `${clientData.firstName} ${clientData.lastName}`,
      phone: clientData.phone,
      address: {
        line1: clientData.address?.street,
        city: clientData.address?.city,
        postal_code: clientData.address?.postalCode,
        country: 'GR'
      },
      metadata: {
        clientId: clientData._id.toString(),
        vatNumber: clientData.vatNumber
      }
    });

    return customer;
  }

  async createStripePaymentIntent(amount, currency = 'EUR', metadata = {}) {
    if (!this.providers.stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await this.providers.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      payment_method_types: ['card'],
      capture_method: 'automatic'
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    };
  }

  async createStripeInvoice(clientId, items, options = {}) {
    if (!this.providers.stripe) {
      throw new Error('Stripe is not configured');
    }

    // Get or create customer
    let customerId = options.stripeCustomerId;
    if (!customerId) {
      const client = await Client.findById(clientId);
      if (client.stripeCustomerId) {
        customerId = client.stripeCustomerId;
      } else {
        const customer = await this.createStripeCustomer(client);
        customerId = customer.id;
        client.stripeCustomerId = customerId;
        await client.save();
      }
    }

    // Create invoice
    const invoice = await this.providers.stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: options.daysUntilDue || 30,
      metadata: {
        clientId,
        ...options.metadata
      }
    });

    // Add line items
    for (const item of items) {
      await this.providers.stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        description: item.description,
        amount: Math.round(item.amount * 100),
        currency: 'eur',
        tax_rates: item.taxRate ? [await this.getOrCreateTaxRate(item.taxRate)] : []
      });
    }

    // Finalize invoice
    const finalizedInvoice = await this.providers.stripe.invoices.finalizeInvoice(invoice.id);

    // Send invoice if requested
    if (options.sendImmediately) {
      await this.providers.stripe.invoices.sendInvoice(finalizedInvoice.id);
    }

    return {
      id: finalizedInvoice.id,
      number: finalizedInvoice.number,
      amount: finalizedInvoice.amount_due / 100,
      pdfUrl: finalizedInvoice.invoice_pdf,
      hostedUrl: finalizedInvoice.hosted_invoice_url,
      status: finalizedInvoice.status
    };
  }

  async getOrCreateTaxRate(percentage) {
    const taxRates = await this.providers.stripe.taxRates.list({
      active: true,
      limit: 100
    });

    let taxRate = taxRates.data.find(tr => tr.percentage === percentage && tr.jurisdiction === 'GR');

    if (!taxRate) {
      taxRate = await this.providers.stripe.taxRates.create({
        display_name: `ΦΠΑ ${percentage}%`,
        description: `Greek VAT ${percentage}%`,
        jurisdiction: 'GR',
        percentage: percentage,
        inclusive: false
      });
    }

    return taxRate.id;
  }

  async createStripeSubscription(customerId, priceId, options = {}) {
    if (!this.providers.stripe) {
      throw new Error('Stripe is not configured');
    }

    const subscription = await this.providers.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: options.metadata,
      trial_period_days: options.trialDays
    });

    return subscription;
  }

  async confirmStripePayment(paymentIntentId) {
    if (!this.providers.stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await this.providers.stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      paid: paymentIntent.status === 'succeeded'
    };
  }

  // Viva Wallet Methods
  async getVivaAccessToken() {
    if (!this.providers.viva) {
      throw new Error('Viva Wallet is not configured');
    }

    const baseUrl = this.providers.viva.environment === 'production' 
      ? 'https://accounts.vivapayments.com'
      : 'https://demo-accounts.vivapayments.com';

    const response = await axios.post(`${baseUrl}/connect/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: this.providers.viva.clientId,
          password: this.providers.viva.clientSecret
        }
      }
    );

    return response.data.access_token;
  }

  async createVivaOrder(amount, customerData, options = {}) {
    if (!this.providers.viva) {
      throw new Error('Viva Wallet is not configured');
    }

    const token = await this.getVivaAccessToken();
    const baseUrl = this.providers.viva.environment === 'production'
      ? 'https://api.vivapayments.com'
      : 'https://demo-api.vivapayments.com';

    const orderData = {
      amount: Math.round(amount * 100), // Convert to cents
      customerTrns: `${customerData.firstName} ${customerData.lastName}`,
      customer: {
        email: customerData.email,
        fullName: `${customerData.firstName} ${customerData.lastName}`,
        phone: customerData.mobile || customerData.phone,
        countryCode: 'GR'
      },
      paymentTimeout: 300, // 5 minutes
      preauth: false,
      allowRecurring: false,
      maxInstallments: 0,
      merchantTrns: options.merchantReference || `ORDER-${Date.now()}`,
      disableExactAmount: false,
      tags: options.tags || ['Legal Services']
    };

    const response = await axios.post(
      `${baseUrl}/checkout/v2/orders`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      orderCode: response.data.orderCode,
      checkoutUrl: `https://demo.vivapayments.com/web/checkout?ref=${response.data.orderCode}`,
      amount: amount,
      expiresAt: new Date(Date.now() + 300000) // 5 minutes
    };
  }

  async getVivaTransaction(transactionId) {
    if (!this.providers.viva) {
      throw new Error('Viva Wallet is not configured');
    }

    const token = await this.getVivaAccessToken();
    const baseUrl = this.providers.viva.environment === 'production'
      ? 'https://api.vivapayments.com'
      : 'https://demo-api.vivapayments.com';

    const response = await axios.get(
      `${baseUrl}/checkout/v2/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return {
      id: response.data.transactionId,
      status: response.data.statusId === 'F' ? 'succeeded' : 'pending',
      amount: response.data.amount / 100,
      fee: response.data.fee / 100,
      netAmount: (response.data.amount - response.data.fee) / 100,
      cardType: response.data.cardType,
      maskedPan: response.data.maskedPan
    };
  }

  // Appointment Payment
  async createAppointmentPayment(appointment, provider = 'stripe') {
    const amount = appointment.amount || 80; // Default appointment fee

    if (provider === 'stripe') {
      const metadata = {
        appointmentId: appointment._id.toString(),
        clientId: appointment.client._id.toString(),
        userId: appointment.user._id.toString(),
        type: 'appointment'
      };

      return await this.createStripePaymentIntent(amount, 'EUR', metadata);
    } else if (provider === 'viva') {
      const client = await Client.findById(appointment.client);
      return await this.createVivaOrder(amount, client, {
        merchantReference: `APT-${appointment._id}`,
        tags: ['Appointment', appointment.type]
      });
    } else {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  // Invoice Payment
  async createInvoicePayment(invoice, provider = 'stripe') {
    if (provider === 'stripe') {
      return await this.createStripeInvoice(invoice.client, invoice.items, {
        metadata: {
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.number
        },
        daysUntilDue: invoice.paymentTerms || 30,
        sendImmediately: true
      });
    } else if (provider === 'viva') {
      const client = await Client.findById(invoice.client);
      const totalAmount = invoice.items.reduce((sum, item) => sum + item.amount, 0);
      
      return await this.createVivaOrder(totalAmount, client, {
        merchantReference: invoice.number,
        tags: ['Invoice', invoice.category]
      });
    } else {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }

  // Webhook Handlers
  async handleStripeWebhook(req) {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    let event;

    try {
      event = this.providers.stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object, 'stripe');
        break;
        
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object, 'stripe');
        break;
        
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleSubscriptionEvent(event);
        break;
        
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  async handleVivaWebhook(req) {
    const signature = req.headers['x-viva-signature'];
    const webhookKey = process.env.VIVA_WEBHOOK_KEY;

    if (!webhookKey) {
      throw new Error('Viva webhook key not configured');
    }

    // Verify signature
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookKey)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid webhook signature');
    }

    const { eventTypeId, data } = req.body;

    switch (eventTypeId) {
      case 1: // Transaction created
        await this.handlePaymentSuccess(data, 'viva');
        break;
        
      case 2: // Transaction failed
        await this.handlePaymentFailure(data, 'viva');
        break;
        
      default:
        console.log(`Unhandled Viva event type: ${eventTypeId}`);
    }

    return { received: true };
  }

  // Payment Event Handlers
  async handlePaymentSuccess(paymentData, provider) {
    let appointmentId, amount, transactionId;

    if (provider === 'stripe') {
      appointmentId = paymentData.metadata.appointmentId;
      amount = paymentData.amount / 100;
      transactionId = paymentData.id;
    } else if (provider === 'viva') {
      // Extract from merchantTrns
      const match = paymentData.merchantTrns.match(/APT-(.+)/);
      appointmentId = match ? match[1] : null;
      amount = paymentData.amount / 100;
      transactionId = paymentData.transactionId;
    }

    if (appointmentId) {
      // Update appointment as paid
      await Appointment.findByIdAndUpdate(appointmentId, {
        paid: true,
        paymentDate: new Date(),
        paymentMethod: provider,
        transactionId
      });

      // Create financial record
      const appointment = await Appointment.findById(appointmentId)
        .populate('client user');

      await Financial.create({
        user: appointment.user._id,
        client: appointment.client._id,
        type: 'income',
        category: 'consultation',
        amount: amount,
        vatRate: 24,
        description: `Ραντεβού ${appointment.purpose}`,
        date: new Date(),
        paymentMethod: provider === 'stripe' ? 'card' : 'viva',
        referenceType: 'appointment',
        referenceId: appointmentId,
        status: 'completed',
        transactionId
      });

      // Send confirmation email
      const emailService = require('../utils/sendEmail');
      await emailService({
        email: appointment.client.email,
        subject: 'Επιβεβαίωση Πληρωμής Ραντεβού',
        message: `Η πληρωμή σας ύψους €${amount} για το ραντεβού της ${moment(appointment.date).format('DD/MM/YYYY HH:mm')} ολοκληρώθηκε επιτυχώς.`
      });
    }
  }

  async handlePaymentFailure(paymentData, provider) {
    // Log failed payment
    console.error('Payment failed:', paymentData);

    // Update appointment if applicable
    if (paymentData.metadata?.appointmentId) {
      await Appointment.findByIdAndUpdate(paymentData.metadata.appointmentId, {
        paymentFailed: true,
        paymentFailureReason: paymentData.last_payment_error?.message || 'Unknown error'
      });
    }
  }

  async handleInvoicePaid(invoice) {
    const financialId = invoice.metadata.financialId;
    
    if (financialId) {
      await Financial.findByIdAndUpdate(financialId, {
        status: 'completed',
        paidAt: new Date(),
        paymentMethod: 'card',
        transactionId: invoice.payment_intent
      });
    }
  }

  async handleInvoicePaymentFailed(invoice) {
    const financialId = invoice.metadata.financialId;
    
    if (financialId) {
      await Financial.findByIdAndUpdate(financialId, {
        paymentAttempts: { $inc: 1 },
        lastPaymentAttempt: new Date()
      });
    }
  }

  // Refund Methods
  async createRefund(transactionId, amount, reason, provider = 'stripe') {
    if (provider === 'stripe') {
      const refund = await this.providers.stripe.refunds.create({
        payment_intent: transactionId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || 'requested_by_customer'
      });

      return {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        created: new Date(refund.created * 1000)
      };
    } else if (provider === 'viva') {
      // Viva refund implementation
      const token = await this.getVivaAccessToken();
      // ... implement Viva refund
    }
  }

  // Reporting Methods
  async getPaymentStats(userId, dateRange) {
    const { startDate, endDate } = dateRange;

    const stats = await Financial.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          type: 'income',
          status: 'completed',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $facet: {
          byMethod: [
            {
              $group: {
                _id: '$paymentMethod',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ],
          byMonth: [
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' }
                },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ],
          totals: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
                avgTransaction: { $avg: '$amount' }
              }
            }
          ]
        }
      }
    ]);

    return stats[0];
  }

  // Validation Methods
  validateIBAN(iban) {
    // Greek IBAN validation
    const ibanRegex = /^GR\d{2}\d{3}\d{4}[\dA-Z]{16}$/;
    return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase());
  }

  validateCard(cardNumber) {
    // Luhn algorithm validation
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }
}

// Export singleton instance
const paymentService = new PaymentService();
module.exports = paymentService;