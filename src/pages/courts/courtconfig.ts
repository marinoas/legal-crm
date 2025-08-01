import { GenericConfig } from '../../components/generic/GenericConfig';

export const courtConfig: GenericConfig = {
  entity: 'court',
  
  list: {
    title: 'court.listTitle',
    columns: [
      {
        field: 'dateTime',
        label: 'court.dateTime',
        sortable: true,
        width: 150,
      },
      {
        field: 'client',
        label: 'court.client',
        sortable: true,
        searchable: true,
        width: 200,
      },
      {
        field: 'court',
        label: 'court.court',
        sortable: true,
        searchable: true,
        width: 250,
      },
      {
        field: 'type',
        label: 'court.type',
        sortable: true,
        filterable: true,
        width: 150,
      },
      {
        field: 'hearing',
        label: 'court.hearing',
        sortable: true,
        width: 100,
      },
      {
        field: 'opponent',
        label: 'court.opponent',
        sortable: true,
        searchable: true,
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
    ],
    defaultSort: {
      field: 'date',
      direction: 'asc',
    },
    searchableFields: ['client.lastName', 'client.firstName', 'opponent', 'court', 'type'],
    itemsPerPage: 25,
  },
  
  form: {
    title: 'court.formTitle',
    sections: [
      {
        title: 'court.basicInfo',
        fields: [
          {
            name: 'clientId',
            label: 'court.client',
            type: 'autocomplete',
            dataSource: 'clients',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'folderNumber',
            label: 'client.folderNumber',
            type: 'text',
            helperText: 'court.folderNumberHelper',
            grid: { xs: 12, sm: 6 },
          },
        ],
      },
      {
        title: 'court.courtInfo',
        fields: [
          {
            name: 'level',
            label: 'court.level',
            type: 'select',
            options: [
              { value: 'Πρωτοδικείο', label: 'Πρωτοδικείο' },
              { value: 'Εφετείο', label: 'Εφετείο' },
              { value: 'Άρειος Πάγος', label: 'Άρειος Πάγος' },
              { value: 'Συμβούλιο της Επικρατείας', label: 'Συμβούλιο της Επικρατείας' },
              { value: 'other', label: 'common.other' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'levelOther',
            label: 'court.levelOther',
            type: 'text',
            showIf: (data) => data.level === 'other',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 8 },
          },
          {
            name: 'composition',
            label: 'court.composition',
            type: 'select',
            options: [
              { value: 'Μονομελές', label: 'Μονομελές' },
              { value: 'Πολυμελές', label: 'Πολυμελές' },
              { value: 'Τριμελές', label: 'Τριμελές' },
              { value: 'other', label: 'common.other' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'compositionOther',
            label: 'court.compositionOther',
            type: 'text',
            showIf: (data) => data.composition === 'other',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 8 },
          },
          {
            name: 'city',
            label: 'court.city',
            type: 'autocomplete',
            options: [
              'Αθηνών', 'Πειραιώς', 'Θεσσαλονίκης', 'Πατρών', 'Λάρισας',
              'Ηρακλείου', 'Βόλου', 'Ιωαννίνων', 'Χανίων', 'Κορίνθου',
            ],
            freeSolo: true,
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'court',
            label: 'court.fullName',
            type: 'text',
            readOnly: true,
            computeValue: (data) => {
              const level = data.level === 'other' ? data.levelOther : data.level;
              const composition = data.composition === 'other' ? data.compositionOther : data.composition;
              return `${composition} ${level} ${data.city || ''}`.trim();
            },
            grid: { xs: 12 },
          },
        ],
      },
      {
        title: 'court.caseInfo',
        fields: [
          {
            name: 'date',
            label: 'court.date',
            type: 'date',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'time',
            label: 'court.time',
            type: 'time',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'hearing',
            label: 'court.hearing',
            type: 'select',
            options: [
              { value: 'α\' συζήτηση', label: 'α\' συζήτηση' },
              { value: 'β\' συζήτηση', label: 'β\' συζήτηση' },
              { value: 'γ\' συζήτηση', label: 'γ\' συζήτηση' },
              { value: 'other', label: 'common.other' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'hearingOther',
            label: 'court.hearingOther',
            type: 'text',
            showIf: (data) => data.hearing === 'other',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'type',
            label: 'court.type',
            type: 'select',
            options: [
              { value: 'Ανακοπή 632 ΚΠολΔ', label: 'Ανακοπή 632 ΚΠολΔ' },
              { value: 'Ανακοπή 933 ΚΠολΔ', label: 'Ανακοπή 933 ΚΠολΔ' },
              { value: 'Ανακοπή 954 ΚΠολΔ', label: 'Ανακοπή 954 ΚΠολΔ' },
              { value: 'Ανακοπή 973 ΚΠολΔ', label: 'Ανακοπή 973 ΚΠολΔ' },
              { value: 'Αγωγή', label: 'Αγωγή' },
              { value: 'Έφεση', label: 'Έφεση' },
              { value: 'Αίτηση αναστολής 632 ΚΠολΔ', label: 'Αίτηση αναστολής 632 ΚΠολΔ' },
              { value: 'Αίτηση αναστολής 938 ΚΠολΔ', label: 'Αίτηση αναστολής 938 ΚΠολΔ' },
              { value: 'Αίτηση προσωρινής ρύθμισης', label: 'Αίτηση προσωρινής ρύθμισης' },
              { value: 'other', label: 'common.other' },
            ],
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'typeOther',
            label: 'court.typeOther',
            type: 'text',
            showIf: (data) => data.type === 'other',
            rules: { required: 'validation.required' },
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'opponent',
            label: 'court.opponent',
            type: 'text',
            rules: { required: 'validation.required' },
            grid: { xs: 12 },
          },
        ],
      },
      {
        title: 'court.additionalInfo',
        fields: [
          {
            name: 'notes',
            label: 'common.notes',
            type: 'textarea',
            rows: 4,
            grid: { xs: 12 },
          },
          {
            name: 'autoCreateDeadlines',
            label: 'court.autoCreateDeadlines',
            type: 'checkbox',
            defaultValue: true,
            grid: { xs: 12 },
          },
        ],
      },
    ],
  },
  
  detail: {
    title: 'court.detailTitle',
    sections: [
      {
        title: 'court.basicInfo',
        fields: [
          { label: 'court.client', field: 'client.fullName' },
          { label: 'client.folderNumber', field: 'client.folderNumber', type: 'chip' },
          { label: 'court.dateTime', field: 'dateTime', type: 'dateTime' },
          { label: 'court.status', field: 'status', type: 'status' },
        ],
      },
      {
        title: 'court.courtInfo',
        fields: [
          { label: 'court.court', field: 'court' },
          { label: 'court.level', field: 'level' },
          { label: 'court.composition', field: 'composition' },
          { label: 'court.city', field: 'city' },
        ],
      },
      {
        title: 'court.caseInfo',
        fields: [
          { label: 'court.type', field: 'type' },
          { label: 'court.hearing', field: 'hearing', type: 'chip' },
          { label: 'court.opponent', field: 'opponent' },
          { label: 'court.result', field: 'result', type: 'translate', translatePrefix: 'court.result' },
        ],
      },
      {
        title: 'court.postponements',
        type: 'list',
        fields: [
          { label: 'court.originalDate', field: 'originalDate', type: 'date' },
          { label: 'court.newDate', field: 'newDate', type: 'date' },
          { label: 'court.reason', field: 'reason' },
        ],
        dataField: 'postponements',
      },
      {
        title: 'court.relatedItems',
        fields: [
          { label: 'court.documents', field: 'documents.length', type: 'count' },
          { label: 'court.deadlines', field: 'relatedDeadlines.length', type: 'count' },
        ],
      },
    ],
  },
};
