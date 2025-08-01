import { GenericConfig } from '../../components/generic/GenericConfig';

export const deadlineConfig: GenericConfig = {
  entity: 'deadline',
  
  list: {
    title: 'deadline.listTitle',
    columns: [
      {
        field: 'name',
        label: 'deadline.name',
        sortable: true,
        searchable: true,
        width: 250,
      },
      {
        field: 'client',
        label: 'deadline.client',
        sortable: true,
        searchable: true,
        width: 200,
      },
      {
        field: 'dueDate',
        label: 'deadline.dueDate',
        sortable: true,
        type: 'date',
        width: 150,
      },
      {
        field: 'priority',
        label: 'deadline.priority',
        sortable: true,
        filterable: true,
        width: 100,
      },
      {
        field: 'category',
        label: 'deadline.category',
        sortable: true,
        filterable: true,
        width: 150,
        hideInMobile: true,
      },
      {
        field: 'status',
        label: 'common.status',
        sortable: true,
        filterable: true,
        width: 120,
      },
      {
        field: 'reminders',
        label: 'deadline.reminders',
        sortable: false,
        width: 100,
        hideInMobile: true,
      },
    ],
    defaultSort: {
      field: 'dueDate',
      direction: 'asc',
    },
    searchableFields: ['name', 'client.lastName', 'client.firstName', 'description'],
    itemsPerPage: 25,
  },
  
  form: {
    title: 'deadline.formTitle',
    sections: [
      {
        title: 'deadline.basicInfo',
        fields: [
          {
            name: 'clientId',
            label: 'deadline.client',
            type: 'autocomplete',
            dataSource: 'clients',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'courtId',
            label: 'deadline.relatedCourt',
            type: 'autocomplete',
            dataSource: 'courts',
            filterBy: (data) => ({ clientId: data.clientId }),
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'name',
            label: 'deadline.name',
            type: 'text',
            rules: { required: 'validation.required' },
            grid: { xs: 12 },
          },
          {
            name: 'description',
            label: 'deadline.description',
            type: 'textarea',
            rows: 2,
            grid: { xs: 12 },
          },
        ],
      },
      {
        title: 'deadline.timeInfo',
        fields: [
          {
            name: 'dueDate',
            label: 'deadline.dueDate',
            type: 'date',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'dueTime',
            label: 'deadline.dueTime',
            type: 'time',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'workingDaysOnly',
            label: 'deadline.workingDaysOnly',
            type: 'checkbox',
            defaultValue: true,
            helperText: 'deadline.workingDaysOnlyHelper',
            grid: { xs: 12 },
          },
        ],
      },
      {
        title: 'deadline.categoryPriority',
        fields: [
          {
            name: 'category',
            label: 'deadline.category',
            type: 'select',
            options: [
              { value: 'Κατάθεση δικογράφου', label: 'Κατάθεση δικογράφου' },
              { value: 'Προσθήκη - Αντίκρουση', label: 'Προσθήκη - Αντίκρουση' },
              { value: 'Προθεσμία άσκησης ένδικου μέσου', label: 'Προθεσμία άσκησης ένδικου μέσου' },
              { value: 'Διοικητική προθεσμία', label: 'Διοικητική προθεσμία' },
              { value: 'Συμβατική προθεσμία', label: 'Συμβατική προθεσμία' },
              { value: 'Δικαστική προθεσμία', label: 'Δικαστική προθεσμία' },
              { value: 'Άλλο', label: 'common.other' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'priority',
            label: 'deadline.priority',
            type: 'select',
            options: [
              { value: 'low', label: 'deadline.priority.low' },
              { value: 'medium', label: 'deadline.priority.medium' },
              { value: 'high', label: 'deadline.priority.high' },
              { value: 'urgent', label: 'deadline.priority.urgent' },
            ],
            rules: { required: 'validation.required' },
            defaultValue: 'medium',
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'deadline.reminders',
        fields: [
          {
            name: 'reminders',
            label: 'deadline.remindersConfig',
            type: 'custom',
            component: 'RemindersConfig',
            defaultValue: [
              { daysBefore: 30, method: 'notification', sent: false },
              { daysBefore: 20, method: 'notification', sent: false },
              { daysBefore: 10, method: 'notification', sent: false },
              { daysBefore: 5, method: 'email', sent: false },
              { daysBefore: 3, method: 'all', sent: false },
            ],
            grid: { xs: 12 },
          },
        ],
      },
      {
        title: 'deadline.additionalInfo',
        fields: [
          {
            name: 'notes',
            label: 'common.notes',
            type: 'textarea',
            rows: 4,
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
    title: 'deadline.detailTitle',
    sections: [
      {
        title: 'deadline.basicInfo',
        fields: [
          { label: 'deadline.name', field: 'name' },
          { label: 'deadline.client', field: 'client.fullName' },
          { label: 'deadline.relatedCourt', field: 'court.type' },
          { label: 'deadline.description', field: 'description' },
        ],
      },
      {
        title: 'deadline.timeInfo',
        fields: [
          { label: 'deadline.dueDate', field: 'dueDate', type: 'date' },
          { label: 'deadline.dueTime', field: 'dueTime' },
          { label: 'deadline.daysUntilDue', field: 'daysUntilDue', type: 'number' },
          { label: 'deadline.workingDaysUntilDue', field: 'workingDaysUntilDue', type: 'number' },
          { label: 'deadline.workingDaysOnly', field: 'workingDaysOnly', type: 'boolean' },
        ],
      },
      {
        title: 'deadline.categoryPriority',
        fields: [
          { label: 'deadline.category', field: 'category', type: 'chip' },
          { label: 'deadline.priority', field: 'priority', type: 'priority' },
          { label: 'common.status', field: 'status', type: 'status' },
        ],
      },
      {
        title: 'deadline.completionInfo',
        showIf: (data) => data.status === 'completed',
        fields: [
          { label: 'deadline.completedDate', field: 'completedDate', type: 'date' },
          { label: 'deadline.completedBy', field: 'completedBy' },
        ],
      },
      {
        title: 'deadline.extensions',
        type: 'list',
        fields: [
          { label: 'deadline.originalDate', field: 'originalDate', type: 'date' },
          { label: 'deadline.newDate', field: 'newDate', type: 'date' },
          { label: 'deadline.reason', field: 'reason' },
          { label: 'deadline.extendedBy', field: 'extendedBy' },
          { label: 'deadline.extendedAt', field: 'extendedAt', type: 'dateTime' },
        ],
        dataField: 'extensions',
        emptyMessage: 'deadline.noExtensions',
      },
      {
        title: 'deadline.reminders',
        type: 'list',
        fields: [
          { label: 'deadline.daysBefore', field: 'daysBefore', type: 'number' },
          { label: 'deadline.method', field: 'method', type: 'translate', translatePrefix: 'deadline.reminderMethod' },
          { label: 'deadline.sent', field: 'sent', type: 'boolean' },
          { label: 'deadline.sentDate', field: 'sentDate', type: 'dateTime' },
        ],
        dataField: 'reminders',
      },
    ],
  },
};
