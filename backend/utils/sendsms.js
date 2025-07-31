const twilio = require('twilio');
const Settings = require('../models/Settings');

// Initialize Twilio client
let twilioClient = null;

const initializeTwilio = async () => {
  try {
    const settings = await Settings.getByCategory('sms');
    const smsSettings = settings.sms;

    if (smsSettings && smsSettings.provider === 'twilio' && smsSettings.twilio.accountSid) {
      twilioClient = twilio(
        smsSettings.twilio.accountSid || process.env.TWILIO_ACCOUNT_SID,
        smsSettings.twilio.authToken || process.env.TWILIO_AUTH_TOKEN
      );
    }
  } catch (error) {
    console.error('Twilio initialization error:', error);
  }
};

// Send SMS
const sendSMS = async (options) => {
  try {
    // Get SMS settings
    const settings = await Settings.getByCategory('sms');
    const smsSettings = settings.sms;

    if (!smsSettings || !smsSettings.enabled) {
      throw new Error('SMS service is not enabled');
    }

    if (smsSettings.provider === 'twilio') {
      // Initialize Twilio if not already done
      if (!twilioClient) {
        await initializeTwilio();
      }

      if (!twilioClient) {
        throw new Error('Twilio client not initialized');
      }

      // Format phone number for Greece
      let to = options.to;
      if (!to.startsWith('+')) {
        // Assume Greek number if no country code
        if (to.startsWith('30')) {
          to = `+${to}`;
        } else {
          to = `+30${to}`;
        }
      }

      // Send SMS
      const message = await twilioClient.messages.create({
        body: options.text,
        from: smsSettings.twilio.fromNumber || process.env.TWILIO_PHONE_NUMBER,
        to: to
      });

      return {
        success: true,
        messageId: message.sid,
        status: message.status,
        to: message.to,
        price: message.price,
        priceUnit: message.priceUnit
      };
    } else {
      throw new Error(`SMS provider ${smsSettings.provider} not implemented yet`);
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    throw new Error(`Αποτυχία αποστολής SMS: ${error.message}`);
  }
};

// Send SMS with template
const sendTemplateSMS = async (to, templateName, variables = {}) => {
  try {
    const settings = await Settings.getByCategory('sms');
    const template = settings.sms.templates[templateName];

    if (!template) {
      throw new Error(`SMS template '${templateName}' not found`);
    }

    // Replace variables in template
    let text = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      text = text.replace(regex, variables[key]);
    });

    // Check SMS length (160 characters for Greek)
    if (text.length > 160) {
      console.warn(`SMS template '${templateName}' exceeds 160 characters: ${text.length} chars`);
    }

    return await sendSMS({ to, text });
  } catch (error) {
    console.error('Template SMS error:', error);
    throw error;
  }
};

// Send bulk SMS
const sendBulkSMS = async (recipients, options) => {
  const results = {
    successful: [],
    failed: []
  };

  for (const recipient of recipients) {
    try {
      const result = await sendSMS({
        ...options,
        to: recipient.mobile || recipient
      });
      results.successful.push({
        mobile: recipient.mobile || recipient,
        messageId: result.messageId
      });
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.failed.push({
        mobile: recipient.mobile || recipient,
        error: error.message
      });
    }
  }

  return results;
};

// SMS templates
const smsTemplates = {
  // Appointment reminder
  appointmentReminder: (appointment, client) => {
    const date = new Date(appointment.startTime).toLocaleDateString('el-GR');
    const time = new Date(appointment.startTime).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
    return `Υπενθύμιση: Ραντεβού ${date} στις ${time}. ${process.env.BUSINESS_NAME}`;
  },

  // Court reminder
  courtReminder: (court, client, daysBefore) => {
    const date = new Date(court.hearingDate).toLocaleDateString('el-GR');
    return `Υπενθύμιση: Δικάσιμος ${court.caseTitle} ${daysBefore === 0 ? 'σήμερα' : `σε ${daysBefore} ημέρες`} (${date}). ${process.env.BUSINESS_NAME}`;
  },

  // Deadline reminder
  deadlineReminder: (deadline, client, daysBefore) => {
    const date = new Date(deadline.dueDate).toLocaleDateString('el-GR');
    return `Προθεσμία "${deadline.name}" λήγει ${daysBefore === 0 ? 'σήμερα' : `σε ${daysBefore} ημέρες`} (${date}). ${process.env.BUSINESS_NAME}`;
  },

  // Payment confirmation
  paymentConfirmation: (amount) => {
    return `Λάβαμε την πληρωμή σας €${amount}. Ευχαριστούμε. ${process.env.BUSINESS_NAME}`;
  },

  // Generic notification
  notification: (message) => {
    return `${message} - ${process.env.BUSINESS_NAME}`;
  }
};

// Validate Greek mobile number
const validateGreekMobile = (mobile) => {
  // Remove country code if present
  let number = mobile.replace(/^\+30/, '').replace(/^30/, '');
  
  // Remove any non-digits
  number = number.replace(/\D/g, '');
  
  // Greek mobile numbers start with 69 and have 10 digits total
  if (number.length === 10 && number.startsWith('69')) {
    return true;
  }
  
  return false;
};

// Format mobile number for display
const formatMobileNumber = (mobile) => {
  // Remove country code if present
  let number = mobile.replace(/^\+30/, '').replace(/^30/, '');
  
  // Remove any non-digits
  number = number.replace(/\D/g, '');
  
  // Format as 69X XXX XXXX
  if (number.length === 10) {
    return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  }
  
  return mobile;
};

// Calculate SMS cost (approximate)
const calculateSMSCost = (text, recipientCount = 1) => {
  // Greek characters count as 2 in SMS
  const greekCharRegex = /[ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω]/g;
  const greekChars = (text.match(greekCharRegex) || []).length;
  const otherChars = text.length - greekChars;
  
  // Calculate character count (Greek chars count as 2)
  const totalChars = greekChars * 2 + otherChars;
  
  // Calculate number of SMS parts (70 chars per part for Unicode)
  const parts = Math.ceil(totalChars / 70);
  
  // Approximate cost in EUR (example: €0.05 per SMS part)
  const costPerPart = 0.05;
  const totalCost = parts * recipientCount * costPerPart;
  
  return {
    characterCount: totalChars,
    parts: parts,
    costPerRecipient: parts * costPerPart,
    totalCost: totalCost
  };
};

module.exports = {
  sendSMS,
  sendTemplateSMS,
  sendBulkSMS,
  smsTemplates,
  validateGreekMobile,
  formatMobileNumber,
  calculateSMSCost,
  initializeTwilio
};
