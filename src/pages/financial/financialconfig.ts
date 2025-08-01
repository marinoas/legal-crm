import { GenericConfig } from '../../components/generic/GenericConfig';

export const financialConfig: GenericConfig = {
  entity: 'financial',
  
  list: {
    title: 'financial.listTitle',
    columns: [
      {
        field: 'date',
        label: 'common.date',
        sortable: true,
        type: 'date',
        width: 120,
      },
      {
        field: 'type',
        label: 'financial.type',
        sortable: true,
        filterable: true,
        width: 120,
      },
      {
        field: 'client',
        label: 'financial.client',
        sortable: true,
        searchable: true,
        width: 200,
      },
      {
        field: 'description',
        label: 'financial.description',
        sortable: false,
        searchable: true,
        width: 250,
      },
      {
        field: 'category',
        label: 'financial.category',
        sortable: true,
        filterable: true,
        width: 150,
        hideInMobile: true,
      },
      {
        field: 'amount',
        label: 'financial.amount',
        sortable: true,
        type: 'currency',
        width: 120,
        align: 'right',
      },
      {
        field: 'invoice',
        label: 'financial.invoice',
        sortable: false,
        width: 150,
      },
      {
        field: 'status',
        label: 'common.status',
        sortable: true,
        filterable: true,
        width: 120,
      },
    ],
    defaultSort: {
      field: 'date',
      direction: 'desc',
    },
    searchableFields: ['description', 'client.lastName', 'client.firstName', 'invoice.number'],
    itemsPerPage: 50,
  },
  
  form: {
    title: 'financial.formTitle',
    sections: [
      {
        title: 'financial.transactionInfo',
        fields: [
          {
            name: 'type',
            label: 'financial.type',
            type: 'select',
            options: [
              { value: 'charge', label: 'financial.type.charge' },
              { value: 'payment', label: 'financial.type.payment' },
              { value: 'expense', label: 'financial.type.expense' },
              { value: 'refund', label: 'financial.type.refund' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'date',
            label: 'common.date',
            type: 'date',
            rules: { required: 'validation.required' },
            defaultValue: new Date().toISOString().split('T')[0],
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'clientId',
            label: 'financial.client',
            type: 'autocomplete',
            dataSource: 'clients',
            showIf: (data) => ['charge', 'payment', 'refund'].includes(data.type),
            rules: { 
              required: {
                value: true,
                message: 'validation.required',
              }
            },
            grid: { xs: 12 },
          },
          {
            name: 'category',
            label: 'financial.category',
            type: 'select',
            options: [
              // Income categories
              { value: 'Αμοιβή υπόθεσης', label: 'Αμοιβή υπόθεσης' },
              { value: 'Συμβουλευτική', label: 'Συμβουλευτική' },
              { value: 'Σύνταξη εγγράφου', label: 'Σύνταξη εγγράφου' },
              { value: 'Παράσταση', label: 'Παράσταση' },
              { value: 'Γνωμοδότηση', label: 'Γνωμοδότηση' },
              { value: 'Προκαταβολή', label: 'Προκαταβολή' },
              { value: 'Δικαστικά έξοδα', label: 'Δικαστικά έξοδα' },
              // Expense categories
              { value: 'Ενοίκιο', label: 'Ενοίκιο' },
              { value: 'Λογαριασμοί', label: 'Λογαριασμοί' },
              { value: 'Μισθοδοσία', label: 'Μισθοδοσία' },
              { value: 'Εξοπλισμός', label: 'Εξοπλισμός' },
              { value: 'Αναλώσιμα', label: 'Αναλώσιμα' },
              { value: 'Μετακινήσεις', label: 'Μετακινήσεις' },
              { value: 'Φόροι', label: 'Φόροι' },
              { value: 'Ασφάλιση', label: 'Ασφάλιση' },
              { value: 'Συνδρομές', label: 'Συνδρομές' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Άλλο', label: 'Άλλο' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'categoryOther',
            label: 'financial.categoryOther',
            type: 'text',
            showIf: (data) => data.category === 'Άλλο',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'description',
            label: 'financial.description',
            type: 'text',
            rules: { required: 'validation.required' },
            grid: { xs: 12 },
          },
        ],
      },
      {
        title: 'financial.amountInfo',
        fields: [
          {
            name: 'amount',
            label: 'financial.amount',
            type: 'number',
            rules: { 
              required: 'validation.required',
              min: { value: 0.01, message: 'validation.min' }
            },
            adornment: '€',
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'includesVAT',
            label: 'financial.includesVAT',
            type: 'checkbox',
            defaultValue: true,
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'vat.percentage',
            label: 'financial.vatPercentage',
            type: 'select',
            options: [
              { value: 0, label: '0%' },
              { value: 6, label: '6%' },
              { value: 13, label: '13%' },
              { value: 24, label: '24%' },
            ],
            defaultValue: 24,
            grid: { xs: 12, sm: 4 },
          },
        ],
      },
      {
        title: 'financial.paymentInfo',
        showIf: (data) => ['payment', 'expense'].includes(data.type),
        fields: [
          {
            name: 'paymentMethod',
            label: 'financial.paymentMethod',
            type: 'select',
            options: [
              { value: 'cash', label: 'financial.paymentMethod.cash' },
              { value: 'card', label: 'financial.paymentMethod.card' },
              { value: 'transfer', label: 'financial.paymentMethod.transfer' },
              { value: 'check', label: 'financial.paymentMethod.check' },
              { value: 'paypal', label: 'financial.paymentMethod.paypal' },
              { value: 'stripe', label: 'financial.paymentMethod.stripe' },
              { value: 'viva', label: 'financial.paymentMethod.viva' },
              { value: 'other', label: 'financial.paymentMethod.other' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'paymentReference',
            label: 'financial.paymentReference',
            type: 'text',
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'financial.receiptInfo',
        showIf: (data) => data.type === 'expense',
        fields: [
          {
            name: 'receipt.vendor',
            label: 'financial.vendor',
            type: 'text',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'receipt.number',
            label: 'financial.receiptNumber',
            type: 'text',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'receipt.file',
            label: 'financial.receiptFile',
            type: 'file',
            accept: 'image/*,.pdf',
            grid: { xs: 12 },
          },
        ],
      },
      {
        title: 'financial.invoiceSettings',
        showIf: (data) => data.type === 'charge',
        fields: [
          {
            name: 'invoice.dueDate',
            label: 'financial.dueDate',
            type: 'date',
            helperText: 'financial.dueDateHelper',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'invoice.autoIssue',
            label: 'financial.autoIssueInvoice',
            type: 'checkbox',
            defaultValue: false,
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'financial.recurringSettings',
        fields: [
          {
            name: 'recurring.enabled',
            label: 'financial.recurring',
            type: 'checkbox',
            defaultValue: false,
            grid: { xs: 12 },
          },
          {
            name: 'recurring.frequency',
            label: 'financial.frequency',
            type: 'select',
            options: [
              { value: 'monthly', label: 'financial.frequency.monthly' },
              { value: 'quarterly', label: 'financial.frequency.quarterly' },
              { value: 'annually', label: 'financial.frequency.annually' },
            ],
            showIf: (data) => data.recurring?.enabled,
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'recurring.endDate',
            label: 'financial.recurringEndDate',
            type: 'date',
            showIf: (data) => data.recurring?.enabled,
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'financial.additionalInfo',
        fields: [
          {
            name: 'notes',
            label: 'common.notes',
            type: 'textarea',
            rows: 3,
            grid: { xs: 12 },
          },
          {
            name: 'privateNotes',
            label: 'financial.privateNotes',
            type: 'textarea',
            rows: 3,
            helperText: 'financial.privateNotesHelper',
            grid: { xs: 12 },
          },
          {
            name: 'tags',
            label: 'common.tags',
            type: 'tags',
            grid: { xs: 12 },
          },
        ],
      },
    ],
  },
  
  detail: {
    title: 'financial.detailTitle',
    sections: [
      {
        title: 'financial.transactionInfo',
        fields: [
          { label: 'financial.type', field: 'type', type: 'translate', translatePrefix: 'financial.type' },
          { label: 'common.date', field: 'date', type: 'date' },
          { label: 'financial.client', field: 'client.fullName' },
          { label: 'financial.category', field: 'category' },
          { label: 'financial.description', field: 'description' },
          { label: 'common.status', field: 'status', type: 'status' },
        ],
      },
      {
        title: 'financial.amountInfo',
        fields: [
          { label: 'financial.netAmount', field: 'netAmount', type: 'currency' },
          { label: 'financial.vatAmount', field: 'vat.amount', type: 'currency' },
          { label: 'financial.vatPercentage', field: 'vat.percentage', suffix: '%' },
          { label: 'financial.totalAmount', field: 'amount', type: 'currency' },
        ],
      },
      {
        title: 'financial.paymentInfo',
        showIf: (data) => ['payment', 'expense'].includes(data.type),
        fields: [
          { label: 'financial.paymentMethod', field: 'paymentMethod', type: 'translate', translatePrefix: 'financial.paymentMethod' },
          { label: 'financial.paymentReference', field: 'paymentReference' },
          { label: 'financial.bankAccount', field: 'bankAccount.iban' },
        ],
      },
      {
        title: 'financial.invoiceInfo',
        showIf: (data) => data.invoice?.issued,
        fields: [
          { label: 'financial.invoiceNumber', field: 'invoice.number' },
          { label: 'financial.invoiceSeries', field: 'invoice.series' },
          { label: 'financial.issuedDate', field: 'invoice.issuedDate', type: 'date' },
          { label: 'financial.dueDate', field: 'invoice.dueDate', type: 'date' },
          { label: 'financial.paid', field: 'invoice.paid', type: 'boolean' },
          { label: 'financial.paidDate', field: 'invoice.paidDate', type: 'date' },
          { label: 'financial.sentToClient', field: 'invoice.sentToClient', type: 'boolean' },
        ],
      },
      {
        title: 'financial.receiptInfo',
        showIf: (data) => data.type === 'expense' && data.receipt,
        fields: [
          { label: 'financial.vendor', field: 'receipt.vendor' },
          { label: 'financial.receiptNumber', field: 'receipt.number' },
          { label: 'financial.receiptFile', field: 'receipt.file', type: 'file' },
        ],
      },
      {
        title: 'financial.recurringInfo',
        showIf: (data) => data.recurring?.enabled,
        fields: [
          { label: 'financial.frequency', field: 'recurring.frequency', type: 'translate', translatePrefix: 'financial.frequency' },
          { label: 'financial.nextDate', field: 'recurring.nextDate', type: 'date' },
          { label: 'financial.recurringEndDate', field: 'recurring.endDate', type: 'date' },
        ],
      },
      {
        title: 'financial.notes',
        fields: [
          { label: 'common.notes', field: 'notes' },
          { label: 'financial.privateNotes', field: 'privateNotes' },
        ],
      },
    ],
  },
};
