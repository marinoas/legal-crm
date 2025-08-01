// src/services/financialService.ts
import { apiClient } from './api';
import { Financial, FinancialFormData, FinancialType, FinancialCategory } from '../types/financial';
import { PaginatedResponse, QueryParams } from '../types/common';

// Types
interface FinancialFilters extends QueryParams {
  clientId?: string;
  type?: FinancialType;
  category?: FinancialCategory;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  paymentMethod?: string;
  status?: 'pending' | 'completed' | 'cancelled' | 'overdue';
  invoiceIssued?: boolean;
  invoicePaid?: boolean;
  search?: string;
}

interface FinancialStatistics {
  income: {
    total: number;
    byCategory: Record<string, number>;
    byMonth: Array<{ month: string; amount: number }>;
    pending: number;
    overdue: number;
  };
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    byMonth: Array<{ month: string; amount: number }>;
  };
  profit: {
    total: number;
    byMonth: Array<{ month: string; amount: number }>;
    margin: number;
  };
  vat: {
    collected: number;
    paid: number;
    balance: number;
  };
  clients: {
    totalDebt: number;
    topDebtors: Array<{
      clientId: string;
      clientName: string;
      balance: number;
    }>;
  };
  invoices: {
    issued: number;
    paid: number;
    pending: number;
    overdue: number;
    averagePaymentTime: number; // days
  };
}

interface Invoice {
  number: string;
  series: string;
  date: string;
  dueDate: string;
  client: {
    id: string;
    name: string;
    afm: string;
    address: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vat: number;
    total: number;
  }>;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  paid: boolean;
  paidDate?: string;
  paymentMethod?: string;
}

interface FinancialReport {
  type: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'vat_report' | 'client_statement';
  period: {
    from: string;
    to: string;
  };
  data: any; // Specific to report type
  generatedAt: string;
  generatedBy: string;
}

interface PaymentPlan {
  id: string;
  clientId: string;
  totalAmount: number;
  installments: Array<{
    number: number;
    amount: number;
    dueDate: string;
    paid: boolean;
    paidDate?: string;
    financialId?: string;
  }>;
  status: 'active' | 'completed' | 'defaulted';
  createdAt: string;
}

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  iban: string;
  swift?: string;
  balance: number;
  isDefault: boolean;
}

interface FinancialSettings {
  invoiceSeries: string;
  nextInvoiceNumber: number;
  defaultPaymentTerms: number; // days
  vatRate: number;
  vatIncluded: boolean;
  categories: {
    income: string[];
    expense: string[];
  };
  paymentMethods: string[];
  emailTemplates: {
    invoice: string;
    receipt: string;
    reminder: string;
    overdue: string;
  };
}

class FinancialService {
  private readonly basePath = '/financial';

  /**
   * Get paginated list of financial transactions
   */
  async getTransactions(filters?: FinancialFilters): Promise<PaginatedResponse<Financial>> {
    const { data } = await apiClient.get<PaginatedResponse<Financial>>(
      this.basePath,
      { params: filters }
    );
    return data;
  }

  /**
   * Get single transaction by ID
   */
  async getTransaction(id: string): Promise<Financial> {
    const { data } = await apiClient.get<Financial>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Create new transaction
   */
  async createTransaction(financialData: FinancialFormData): Promise<Financial> {
    const { data } = await apiClient.post<Financial>(this.basePath, financialData);
    return data;
  }

  /**
   * Update transaction
   */
  async updateTransaction(
    id: string,
    financialData: Partial<FinancialFormData>
  ): Promise<Financial> {
    const { data } = await apiClient.put<Financial>(
      `${this.basePath}/${id}`,
      financialData
    );
    return data;
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Issue invoice for charge
   */
  async issueInvoice(
    transactionId: string,
    options?: {
      sendEmail?: boolean;
      customMessage?: string;
    }
  ): Promise<Invoice> {
    const { data } = await apiClient.post<Invoice>(
      `${this.basePath}/${transactionId}/issue-invoice`,
      options
    );
    return data;
  }

  /**
   * Get invoice
   */
  async getInvoice(invoiceNumber: string): Promise<Invoice> {
    const { data } = await apiClient.get<Invoice>(
      `${this.basePath}/invoices/${invoiceNumber}`
    );
    return data;
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(invoiceNumber: string): Promise<Blob> {
    const { data } = await apiClient.get(
      `${this.basePath}/invoices/${invoiceNumber}/pdf`,
      { responseType: 'blob' }
    );
    return data;
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(
    invoiceNumber: string,
    payment: {
      paymentDate: string;
      paymentMethod: string;
      reference?: string;
    }
  ): Promise<Invoice> {
    const { data } = await apiClient.post<Invoice>(
      `${this.basePath}/invoices/${invoiceNumber}/mark-paid`,
      payment
    );
    return data;
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(invoiceNumber: string, reason: string): Promise<void> {
    await apiClient.post(`${this.basePath}/invoices/${invoiceNumber}/cancel`, {
      reason,
    });
  }

  /**
   * Get financial statistics
   */
  async getStatistics(
    period: { from: string; to: string },
    clientId?: string
  ): Promise<FinancialStatistics> {
    const { data } = await apiClient.get<FinancialStatistics>(
      `${this.basePath}/statistics`,
      { params: { ...period, clientId } }
    );
    return data;
  }

  /**
   * Get client balance
   */
  async getClientBalance(clientId: string): Promise<{
    totalCharges: number;
    totalPayments: number;
    balance: number;
    lastPaymentDate?: string;
    transactions: Financial[];
  }> {
    const { data } = await apiClient.get(
      `${this.basePath}/clients/${clientId}/balance`
    );
    return data;
  }

  /**
   * Get unpaid invoices
   */
  async getUnpaidInvoices(clientId?: string): Promise<Invoice[]> {
    const { data } = await apiClient.get<Invoice[]>(
      `${this.basePath}/invoices/unpaid`,
      { params: { clientId } }
    );
    return data;
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(
    invoiceNumber: string,
    options?: {
      template?: 'reminder' | 'overdue';
      customMessage?: string;
      cc?: string[];
    }
  ): Promise<void> {
    await apiClient.post(
      `${this.basePath}/invoices/${invoiceNumber}/send-reminder`,
      options
    );
  }

  /**
   * Create payment plan
   */
  async createPaymentPlan(
    clientId: string,
    plan: {
      totalAmount: number;
      numberOfInstallments: number;
      startDate: string;
      frequency: 'monthly' | 'bimonthly' | 'quarterly';
    }
  ): Promise<PaymentPlan> {
    const { data } = await apiClient.post<PaymentPlan>(
      `${this.basePath}/payment-plans`,
      { clientId, ...plan }
    );
    return data;
  }

  /**
   * Get payment plans
   */
  async getPaymentPlans(
    filters?: { clientId?: string; status?: string }
  ): Promise<PaymentPlan[]> {
    const { data } = await apiClient.get<PaymentPlan[]>(
      `${this.basePath}/payment-plans`,
      { params: filters }
    );
    return data;
  }

  /**
   * Record payment for installment
   */
  async recordInstallmentPayment(
    planId: string,
    installmentNumber: number,
    payment: {
      amount: number;
      paymentDate: string;
      paymentMethod: string;
    }
  ): Promise<PaymentPlan> {
    const { data } = await apiClient.post<PaymentPlan>(
      `${this.basePath}/payment-plans/${planId}/installments/${installmentNumber}/pay`,
      payment
    );
    return data;
  }

  /**
   * Generate financial report
   */
  async generateReport(
    type: FinancialReport['type'],
    period: { from: string; to: string },
    options?: {
      clientId?: string;
      format?: 'json' | 'pdf' | 'excel';
    }
  ): Promise<FinancialReport | Blob> {
    const { data } = await apiClient.post(
      `${this.basePath}/reports`,
      { type, period, ...options },
      {
        responseType: options?.format && options.format !== 'json' ? 'blob' : 'json',
      }
    );
    return data;
  }

  /**
   * Get bank accounts
   */
  async getBankAccounts(): Promise<BankAccount[]> {
    const { data } = await apiClient.get<BankAccount[]>(
      `${this.basePath}/bank-accounts`
    );
    return data;
  }

  /**
   * Reconcile bank transaction
   */
  async reconcileBankTransaction(
    transactionId: string,
    bankAccountId: string,
    bankReference: string
  ): Promise<Financial> {
    const { data } = await apiClient.post<Financial>(
      `${this.basePath}/${transactionId}/reconcile`,
      { bankAccountId, bankReference }
    );
    return data;
  }

  /**
   * Get financial settings
   */
  async getSettings(): Promise<FinancialSettings> {
    const { data } = await apiClient.get<FinancialSettings>(
      `${this.basePath}/settings`
    );
    return data;
  }

  /**
   * Update financial settings
   */
  async updateSettings(
    settings: Partial<FinancialSettings>
  ): Promise<FinancialSettings> {
    const { data } = await apiClient.put<FinancialSettings>(
      `${this.basePath}/settings`,
      settings
    );
    return data;
  }

  /**
   * Export transactions
   */
  async exportTransactions(
    filters: FinancialFilters,
    format: 'excel' | 'pdf' | 'csv'
  ): Promise<Blob> {
    const { data } = await apiClient.post(
      `${this.basePath}/export`,
      { filters, format },
      { responseType: 'blob' }
    );
    return data;
  }

  /**
   * Get receipt for payment
   */
  async getReceipt(transactionId: string): Promise<Blob> {
    const { data } = await apiClient.get(
      `${this.basePath}/${transactionId}/receipt`,
      { responseType: 'blob' }
    );
    return data;
  }

  /**
   * Upload receipt/document
   */
  async uploadReceipt(transactionId: string, file: File): Promise<Financial> {
    const formData = new FormData();
    formData.append('receipt', file);

    const { data } = await apiClient.post<Financial>(
      `${this.basePath}/${transactionId}/receipt`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }

  /**
   * Get VAT report
   */
  async getVatReport(
    period: { from: string; to: string }
  ): Promise<{
    collected: number;
    paid: number;
    balance: number;
    transactions: Array<{
      date: string;
      type: string;
      description: string;
      net: number;
      vat: number;
      total: number;
    }>;
  }> {
    const { data } = await apiClient.get(`${this.basePath}/vat-report`, {
      params: period,
    });
    return data;
  }

  /**
   * Create recurring transaction
   */
  async createRecurringTransaction(
    transaction: FinancialFormData & {
      recurring: {
        frequency: 'monthly' | 'quarterly' | 'annually';
        startDate: string;
        endDate?: string;
        occurrences?: number;
      };
    }
  ): Promise<Financial> {
    const { data } = await apiClient.post<Financial>(
      `${this.basePath}/recurring`,
      transaction
    );
    return data;
  }
}

// Create singleton instance
const financialService = new FinancialService();

// Export singleton
export default financialService;

// Export types
export type {
  FinancialFilters,
  FinancialStatistics,
  Invoice,
  FinancialReport,
  PaymentPlan,
  BankAccount,
  FinancialSettings,
};
