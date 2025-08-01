import { GenericConfig } from '../../components/generic/GenericConfig';

export const appointmentConfig: GenericConfig = {
  entity: 'appointment',
  
  list: {
    title: 'appointment.listTitle',
    columns: [
      {
        field: 'dateTime',
        label: 'appointment.dateTime',
        sortable: true,
        width: 180,
      },
      {
        field: 'client',
        label: 'appointment.client',
        sortable: true,
        searchable: true,
        width: 200,
      },
      {
        field: 'type',
        label: 'appointment.type',
        sortable: true,
        filterable: true,
        width: 120,
      },
      {
        field: 'status',
        label: 'common.status',
        sortable: true,
        filterable: true,
        width: 120,
      },
      {
        field: 'duration',
        label: 'appointment.duration',
        sortable: true,
        width: 100,
        hideInMobile: true,
      },
      {
        field: 'paid',
        label: 'appointment.payment',
        sortable: true,
        filterable: true,
        width: 100,
      },
    ],
    defaultSort: {
      field: 'date',
      direction: 'desc',
    },
    searchableFields: ['client.lastName', 'client.firstName', 'notes'],
    itemsPerPage: 25,
  },
  
  form: {
    title: 'appointment.formTitle',
    sections: [
      {
        title: 'appointment.basicInfo',
        fields: [
          {
            name: 'clientId',
            label: 'appointment.client',
            type: 'autocomplete',
            dataSource: 'clients',
            rules: { required: 'validation.required' },
            grid: { xs: 12 },
          },
          {
            name: 'date',
            label: 'appointment.date',
            type: 'date',
            rules: { 
              required: 'validation.required',
              validate: (value) => {
                const date = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date >= today || 'appointment.dateInPast';
              }
            },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'time',
            label: 'appointment.time',
            type: 'select',
            options: [
              '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
              '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
              '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
              '18:00', '18:30', '19:00', '19:30',
            ].map(time => ({ value: time, label: time })),
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'duration',
            label: 'appointment.duration',
            type: 'select',
            options: [
              { value: 30, label: '30 λεπτά' },
              { value: 45, label: '45 λεπτά' },
              { value: 60, label: '1 ώρα' },
              { value: 90, label: '1.5 ώρες' },
              { value: 120, label: '2 ώρες' },
            ],
            rules: { required: 'validation.required' },
            defaultValue: 30,
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'type',
            label: 'appointment.type',
            type: 'select',
            options: [
              { value: 'in-person', label: 'appointment.type.inPerson' },
              { value: 'online', label: 'appointment.type.online' },
            ],
            rules: { required: 'validation.required' },
            defaultValue: 'in-person',
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'appointment.paymentInfo',
        fields: [
          {
            name: 'price',
            label: 'appointment.price',
            type: 'number',
            rules: { 
              required: 'validation.required',
              min: { value: 0, message: 'validation.min' }
            },
            defaultValue: 50,
            adornment: '€',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'paid',
            label: 'appointment.paid',
            type: 'checkbox',
            defaultValue: false,
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'paymentId',
            label: 'appointment.paymentId',
            type: 'text',
            readOnly: true,
            showIf: (data) => data.paid,
            grid: { xs: 12 },
          },
        ],
      },
      {
        title: 'appointment.additionalInfo',
        fields: [
          {
            name: 'meetingLink',
            label: 'appointment.meetingLink',
            type: 'url',
            showIf: (data) => data.type === 'online',
            helperText: 'appointment.meetingLinkHelper',
            grid: { xs: 12 },
          },
          {
            name: 'notes',
            label: 'appointment.notes',
            type: 'textarea',
            rows: 3,
            helperText: 'appointment.notesHelper',
            grid: { xs: 12 },
          },
          {
            name: 'privateNotes',
            label: 'appointment.privateNotes',
            type: 'textarea',
            rows: 3,
            helperText: 'appointment.privateNotesHelper',
            grid: { xs: 12 },
          },
        ],
      },
    ],
  },
  
  detail: {
    title: 'appointment.detailTitle',
    sections: [
      {
        title: 'appointment.basicInfo',
        fields: [
          { label: 'appointment.client', field: 'client.fullName' },
          { label: 'appointment.date', field: 'date', type: 'date' },
          { label: 'appointment.time', field: 'time' },
          { label: 'appointment.duration', field: 'duration', suffix: ' λεπτά' },
          { label: 'appointment.type', field: 'type', type: 'translate', translatePrefix: 'appointment.type' },
          { label: 'common.status', field: 'status', type: 'status' },
        ],
      },
      {
        title: 'appointment.paymentInfo',
        fields: [
          { label: 'appointment.price', field: 'price', type: 'currency' },
          { label: 'appointment.paid', field: 'paid', type: 'boolean' },
          { label: 'appointment.paymentId', field: 'paymentId' },
        ],
      },
      {
        title: 'appointment.meetingInfo',
        showIf: (data) => data.type === 'online',
        fields: [
          { label: 'appointment.meetingLink', field: 'meetingLink', type: 'link' },
        ],
      },
      {
        title: 'appointment.notes',
        fields: [
          { label: 'appointment.notes', field: 'notes' },
          { label: 'appointment.privateNotes', field: 'privateNotes' },
        ],
      },
      {
        title: 'appointment.metadata',
        fields: [
          { label: 'common.createdAt', field: 'createdAt', type: 'dateTime' },
          { label: 'common.updatedAt', field: 'updatedAt', type: 'dateTime' },
        ],
      },
    ],
  },
};
