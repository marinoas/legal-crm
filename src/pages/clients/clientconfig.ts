import { GenericConfig } from '../../components/generic/GenericConfig';
import { validators } from '../../utils/validators';

export const clientConfig: GenericConfig = {
  entity: 'client',
  
  list: {
    title: 'client.listTitle',
    columns: [
      {
        field: 'fullName',
        label: 'client.fullName',
        sortable: true,
        searchable: true,
        width: 200,
      },
      {
        field: 'folderNumber',
        label: 'client.folderNumber',
        sortable: true,
        searchable: true,
        width: 120,
      },
      {
        field: 'contact',
        label: 'client.contact',
        sortable: false,
        searchable: false,
        width: 200,
      },
      {
        field: 'vatNumber',
        label: 'common.vatNumber',
        sortable: true,
        searchable: true,
        width: 120,
        hideInMobile: true,
      },
      {
        field: 'status',
        label: 'common.status',
        sortable: true,
        filterable: true,
        width: 100,
      },
      {
        field: 'statistics',
        label: 'client.cases',
        sortable: false,
        width: 120,
        hideInMobile: true,
      },
      {
        field: 'balance',
        label: 'client.balance',
        sortable: true,
        type: 'currency',
        width: 120,
        align: 'right',
      },
      {
        field: 'portalAccess',
        label: 'client.portalAccess',
        sortable: false,
        width: 140,
        hideInMobile: true,
      },
    ],
    defaultSort: {
      field: 'createdAt',
      direction: 'desc',
    },
    searchableFields: ['firstName', 'lastName', 'folderNumber', 'email', 'phone', 'vatNumber'],
    itemsPerPage: 25,
  },
  
  form: {
    title: 'client.formTitle',
    sections: [
      {
        title: 'client.basicInfo',
        fields: [
          {
            name: 'type',
            label: 'client.type',
            type: 'select',
            options: [
              { value: 'individual', label: 'client.type.individual' },
              { value: 'company', label: 'client.type.company' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'folderNumber',
            label: 'client.folderNumber',
            type: 'text',
            rules: { required: 'validation.required' },
            helperText: 'client.folderNumberHelper',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'firstName',
            label: 'common.firstName',
            type: 'text',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
            showIf: (data) => data.type === 'individual',
          },
          {
            name: 'lastName',
            label: 'common.lastName',
            type: 'text',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
            showIf: (data) => data.type === 'individual',
          },
          {
            name: 'fatherName',
            label: 'common.fatherName',
            type: 'text',
            grid: { xs: 12, sm: 6 },
            showIf: (data) => data.type === 'individual',
          },
          {
            name: 'companyName',
            label: 'client.companyName',
            type: 'text',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 12 },
            showIf: (data) => data.type === 'company',
          },
          {
            name: 'vatNumber',
            label: 'common.vatNumber',
            type: 'text',
            rules: {
              validate: (value) => !value || validators.vatNumber(value) || 'validation.invalidVat',
            },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'status',
            label: 'common.status',
            type: 'select',
            options: [
              { value: 'active', label: 'common.status.active' },
              { value: 'inactive', label: 'common.status.inactive' },
              { value: 'archived', label: 'common.status.archived' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'client.contactInfo',
        fields: [
          {
            name: 'email',
            label: 'common.email',
            type: 'email',
            rules: {
              required: 'validation.required',
              validate: validators.email,
            },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'phone',
            label: 'common.phone',
            type: 'phone',
            rules: {
              required: 'validation.required',
              validate: validators.phone,
            },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'mobile',
            label: 'common.mobile',
            type: 'phone',
            mobile: true,
            rules: {
              required: 'validation.required',
              validate: validators.mobile,
            },
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'client.addressInfo',
        fields: [
          {
            name: 'address.street',
            label: 'common.street',
            type: 'text',
            grid: { xs: 12, sm: 8 },
          },
          {
            name: 'address.number',
            label: 'common.number',
            type: 'text',
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'address.city',
            label: 'common.city',
            type: 'text',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'address.postalCode',
            label: 'common.postalCode',
            type: 'text',
            rules: {
              pattern: {
                value: /^[0-9]{5}$/,
                message: 'validation.postalCode',
              },
            },
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'client.additionalInfo',
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
    title: 'client.detailTitle',
    sections: [
      {
        title: 'client.basicInfo',
        fields: [
          { label: 'client.folderNumber', field: 'folderNumber', type: 'chip' },
          { label: 'client.type', field: 'type', type: 'translate', translatePrefix: 'client.type' },
          { label: 'client.fullName', field: 'fullName' },
          { label: 'common.fatherName', field: 'fatherName' },
          { label: 'client.companyName', field: 'companyName' },
          { label: 'common.vatNumber', field: 'vatNumber' },
          { label: 'common.status', field: 'status', type: 'status' },
          { label: 'common.createdAt', field: 'createdAt', type: 'date' },
        ],
      },
      {
        title: 'client.contactInfo',
        fields: [
          { label: 'common.email', field: 'email', type: 'email' },
          { label: 'common.phone', field: 'phone', type: 'phone' },
          { label: 'common.mobile', field: 'mobile', type: 'phone' },
          { label: 'common.address', field: 'fullAddress' },
        ],
      },
      {
        title: 'client.statistics',
        fields: [
          { label: 'client.totalCases', field: 'statistics.totalCases', type: 'number' },
          { label: 'client.activeCases', field: 'statistics.activeCases', type: 'number' },
          { label: 'client.wonCases', field: 'statistics.wonCases', type: 'number' },
          { label: 'client.lostCases', field: 'statistics.lostCases', type: 'number' },
          { label: 'client.totalAppointments', field: 'statistics.totalAppointments', type: 'number' },
          { label: 'client.totalDocuments', field: 'statistics.totalDocuments', type: 'number' },
        ],
      },
      {
        title: 'client.financialSummary',
        fields: [
          { label: 'client.totalCharges', field: 'financialSummary.totalCharges', type: 'currency' },
          { label: 'client.totalPayments', field: 'financialSummary.totalPayments', type: 'currency' },
          { label: 'client.balance', field: 'financialSummary.balance', type: 'currency' },
          { label: 'client.lastPaymentDate', field: 'financialSummary.lastPaymentDate', type: 'date' },
        ],
      },
      {
        title: 'client.portalAccess',
        fields: [
          { label: 'client.hasAccess', field: 'portalAccess.hasAccess', type: 'boolean' },
          { label: 'client.invitationSent', field: 'portalAccess.invitationSent', type: 'date' },
          { label: 'client.invitationAccepted', field: 'portalAccess.invitationAccepted', type: 'date' },
        ],
      },
    ],
  },
};
