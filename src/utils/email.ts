// src/utils/email.ts
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: 'court' | 'deadline' | 'appointment' | 'financial' | 'general' | 'celebration';
}

interface EmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: string[];
  priority?: 'low' | 'normal' | 'high';
  replyTo?: string;
}

interface EmailVariable {
  key: string;
  value: string;
  description?: string;
}

// Predefined email templates
export const emailTemplates: EmailTemplate[] = [
  // Court Templates
  {
    id: 'court_scheduled',
    name: 'Προσδιορισμός Δικαστηρίου',
    category: 'court',
    subject: 'Ενημέρωση για προσδιορισμό δικαστηρίου - {{courtType}} - {{courtDate}}',
    body: `Αγαπητέ/ή {{clientName}},

Σας ενημερώνουμε ότι η υπόθεσή σας {{caseDescription}} προσδιορίστηκε να συζητηθεί ενώπιον του {{courtName}} στη δικάσιμο της {{courtDate}} και ώρα {{courtTime}}.

Είδος δικαστηρίου: {{courtType}}
Αντίδικος: {{opponentName}}
Αίθουσα: {{courtRoom}}

Παρακαλούμε να επικοινωνήσετε μαζί μας για περαιτέρω οδηγίες και προετοιμασία.

Με εκτίμηση,
{{lawyerName}}
{{lawFirmName}}`,
    variables: ['clientName', 'caseDescription', 'courtName', 'courtDate', 'courtTime', 'courtType', 'opponentName', 'courtRoom', 'lawyerName', 'lawFirmName']
  },
  {
    id: 'court_completed',
    name: 'Συζήτηση Δικαστηρίου',
    category: 'court',
    subject: 'Ενημέρωση για τη συζήτηση της υπόθεσής σας',
    body: `Αγαπητέ/ή {{clientName}},

Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας {{caseDescription}} πραγματοποιήθηκε σήμερα {{courtDate}} στο {{courtName}}.

{{additionalInfo}}

Θα σας ενημερώσουμε για την έκδοση της απόφασης μόλις αυτή δημοσιευθεί.

Για οποιαδήποτε πληροφορία, παρακαλούμε επικοινωνήστε με το γραφείο μας.

Με εκτίμηση,
{{lawyerName}}
{{lawFirmName}}`,
    variables: ['clientName', 'caseDescription', 'courtDate', 'courtName', 'additionalInfo', 'lawyerName', 'lawFirmName']
  },
  {
    id: 'court_postponed',
    name: 'Αναβολή Δικαστηρίου',
    category: 'court',
    subject: 'Ενημέρωση για αναβολή δικαστηρίου',
    body: `Αγαπητέ/ή {{clientName}},

Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας {{caseDescription}} που είχε προσδιοριστεί για τη δικάσιμο της {{originalDate}} στο {{courtName}} αναβλήθηκε.

Νέα δικάσιμος: {{newDate}}
Λόγος αναβολής: {{postponementReason}}

Θα επικοινωνήσουμε μαζί σας εγκαίρως πριν τη νέα δικάσιμο για την προετοιμασία της υπόθεσης.

Με εκτίμηση,
{{lawyerName}}
{{lawFirmName}}`,
    variables: ['clientName', 'caseDescription', 'originalDate', 'courtName', 'newDate', 'postponementReason', 'lawyerName', 'lawFirmName']
  },
  {
    id: 'court_cancelled',
    name: 'Ματαίωση Δικαστηρίου',
    category: 'court',
    subject: 'Ενημέρωση για ματαίωση δικαστηρίου',
    body: `Αγαπητέ/ή {{clientName}},

Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας {{caseDescription}} που είχε προσδιοριστεί για τη δικάσιμο της {{courtDate}} στο {{courtName}} ματαιώθηκε.

{{cancellationReason}}

Για τον ορισμό νέας δικασίμου θα σας ενημερώσουμε με νεότερο μήνυμά μας.

Με εκτίμηση,
{{lawyerName}}
{{lawFirmName}}`,
    variables: ['clientName', 'caseDescription', 'courtDate', 'courtName', 'cancellationReason', 'lawyerName', 'lawFirmName']
  },

  // Deadline Templates
  {
    id: 'deadline_reminder',
    name: 'Υπενθύμιση Προθεσμίας',
    category: 'deadline',
    subject: 'Υπενθύμιση: {{deadlineName}} - Λήγει σε {{daysRemaining}} ημέρες',
    body: `Αγαπητέ/ή {{recipientName}},

Σας υπενθυμίζουμε ότι η προθεσμία "{{deadlineName}}" για την υπόθεση {{caseDescription}} λήγει στις {{deadlineDate}}.

Ημέρες που απομένουν: {{daysRemaining}}
Κατηγορία: {{deadlineCategory}}

{{additionalNotes}}

Παρακαλούμε όπως προβείτε στις απαραίτητες ενέργειες εγκαίρως.

Με εκτίμηση,
{{senderName}}`,
    variables: ['recipientName', 'deadlineName', 'caseDescription', 'deadlineDate', 'daysRemaining', 'deadlineCategory', 'additionalNotes', 'senderName']
  },
  {
    id: 'deadline_overdue',
    name: 'Εκπρόθεσμη Προθεσμία',
    category: 'deadline',
    subject: 'ΕΠΕΙΓΟΝ: Εκπρόθεσμη προθεσμία - {{deadlineName}}',
    body: `Αγαπητέ/ή {{recipientName}},

ΠΡΟΣΟΧΗ: Η προθεσμία "{{deadlineName}}" για την υπόθεση {{caseDescription}} έληξε στις {{deadlineDate}}.

Ημέρες καθυστέρησης: {{daysOverdue}}

Παρακαλούμε επικοινωνήστε άμεσα για τις περαιτέρω ενέργειες.

Με εκτίμηση,
{{senderName}}`,
    variables: ['recipientName', 'deadlineName', 'caseDescription', 'deadlineDate', 'daysOverdue', 'senderName']
  },

  // Appointment Templates
  {
    id: 'appointment_confirmation',
    name: 'Επιβεβαίωση Ραντεβού',
    category: 'appointment',
    subject: 'Επιβεβαίωση ραντεβού - {{appointmentDate}} στις {{appointmentTime}}',
    body: `Αγαπητέ/ή {{clientName}},

Σας επιβεβαιώνουμε το ραντεβού σας για τις {{appointmentDate}} και ώρα {{appointmentTime}}.

Τύπος ραντεβού: {{appointmentType}}
Τοποθεσία: {{appointmentLocation}}
Διάρκεια: {{appointmentDuration}} λεπτά

{{paymentInfo}}

Σε περίπτωση που επιθυμείτε να ακυρώσετε ή να αλλάξετε το ραντεβού σας, παρακαλούμε ενημερώστε μας τουλάχιστον 24 ώρες νωρίτερα.

Με εκτίμηση,
{{lawFirmName}}`,
    variables: ['clientName', 'appointmentDate', 'appointmentTime', 'appointmentType', 'appointmentLocation', 'appointmentDuration', 'paymentInfo', 'lawFirmName']
  },
  {
    id: 'appointment_reminder',
    name: 'Υπενθύμιση Ραντεβού',
    category: 'appointment',
    subject: 'Υπενθύμιση ραντεβού - Αύριο στις {{appointmentTime}}',
    body: `Αγαπητέ/ή {{clientName}},

Σας υπενθυμίζουμε το αυριανό σας ραντεβού:

Ημερομηνία: {{appointmentDate}}
Ώρα: {{appointmentTime}}
Τοποθεσία: {{appointmentLocation}}

{{meetingLink}}

Παρακαλούμε να είστε ακριβής στην προσέλευσή σας.

Με εκτίμηση,
{{lawFirmName}}`,
    variables: ['clientName', 'appointmentDate', 'appointmentTime', 'appointmentLocation', 'meetingLink', 'lawFirmName']
  },

  // Financial Templates
  {
    id: 'invoice_issued',
    name: 'Έκδοση Τιμολογίου',
    category: 'financial',
    subject: 'Τιμολόγιο #{{invoiceNumber}} - {{lawFirmName}}',
    body: `Αγαπητέ/ή {{clientName}},

Σας αποστέλλουμε το τιμολόγιο #{{invoiceNumber}} για τις υπηρεσίες που σας παρασχέθηκαν.

Ποσό: {{invoiceAmount}} €
Ημερομηνία έκδοσης: {{invoiceDate}}
Ημερομηνία λήξης: {{dueDate}}

Περιγραφή: {{invoiceDescription}}

Τρόποι πληρωμής:
{{paymentMethods}}

Για οποιαδήποτε διευκρίνιση, παρακαλούμε επικοινωνήστε μαζί μας.

Με εκτίμηση,
{{lawFirmName}}`,
    variables: ['clientName', 'invoiceNumber', 'lawFirmName', 'invoiceAmount', 'invoiceDate', 'dueDate', 'invoiceDescription', 'paymentMethods']
  },
  {
    id: 'payment_received',
    name: 'Επιβεβαίωση Πληρωμής',
    category: 'financial',
    subject: 'Επιβεβαίωση πληρωμής - Τιμολόγιο #{{invoiceNumber}}',
    body: `Αγαπητέ/ή {{clientName}},

Σας επιβεβαιώνουμε ότι λάβαμε την πληρωμή σας για το τιμολόγιο #{{invoiceNumber}}.

Ποσό που ελήφθη: {{paymentAmount}} €
Ημερομηνία πληρωμής: {{paymentDate}}
Τρόπος πληρωμής: {{paymentMethod}}

Υπόλοιπο λογαριασμού: {{accountBalance}} €

Σας ευχαριστούμε για τη συνεργασία.

Με εκτίμηση,
{{lawFirmName}}`,
    variables: ['clientName', 'invoiceNumber', 'paymentAmount', 'paymentDate', 'paymentMethod', 'accountBalance', 'lawFirmName']
  },

  // Celebration Templates
  {
    id: 'name_day_wishes',
    name: 'Ευχές Ονομαστικής Εορτής',
    category: 'celebration',
    subject: 'Χρόνια Πολλά για την ονομαστική σας εορτή!',
    body: `Αγαπητέ/ή {{recipientName}},

Με την ευκαιρία της ονομαστικής σας εορτής, σας ευχόμαστε ολόψυχα Χρόνια Πολλά!

Να έχετε υγεία, ευτυχία και κάθε επιτυχία στη ζωή σας.

Με εκτίμηση,
{{senderName}}
{{lawFirmName}}`,
    variables: ['recipientName', 'senderName', 'lawFirmName']
  },
  {
    id: 'birthday_wishes',
    name: 'Ευχές Γενεθλίων',
    category: 'celebration',
    subject: 'Ευχές για τα γενέθλιά σας!',
    body: `Αγαπητέ/ή {{recipientName}},

Σας ευχόμαστε Χρόνια Πολλά για τα γενέθλιά σας!

Να έχετε υγεία, ευτυχία και να πραγματοποιηθούν όλες σας οι επιθυμίες.

Με εκτίμηση,
{{senderName}}
{{lawFirmName}}`,
    variables: ['recipientName', 'senderName', 'lawFirmName']
  },

  // General Templates
  {
    id: 'general_announcement',
    name: 'Γενική Ανακοίνωση',
    category: 'general',
    subject: '{{subject}}',
    body: `Αγαπητέ/ή {{recipientName}},

{{content}}

Με εκτίμηση,
{{senderName}}
{{lawFirmName}}`,
    variables: ['recipientName', 'subject', 'content', 'senderName', 'lawFirmName']
  },
  {
    id: 'document_request',
    name: 'Αίτημα Εγγράφων',
    category: 'general',
    subject: 'Αίτημα για προσκόμιση εγγράφων - {{caseDescription}}',
    body: `Αγαπητέ/ή {{clientName}},

Για την προώθηση της υπόθεσής σας {{caseDescription}}, παρακαλούμε όπως μας προσκομίσετε τα ακόλουθα έγγραφα:

{{documentList}}

Προθεσμία υποβολής: {{deadline}}

Μπορείτε να μας αποστείλετε τα έγγραφα:
- Μέσω email στο {{emailAddress}}
- Μέσω του προσωπικού σας portal
- Με φυσική παρουσία στο γραφείο μας

Για οποιαδήποτε διευκρίνιση, είμαστε στη διάθεσή σας.

Με εκτίμηση,
{{lawyerName}}
{{lawFirmName}}`,
    variables: ['clientName', 'caseDescription', 'documentList', 'deadline', 'emailAddress', 'lawyerName', 'lawFirmName']
  }
];

// Variable descriptions for help text
export const emailVariableDescriptions: Record<string, string> = {
  clientName: 'Το ονοματεπώνυμο του εντολέα',
  recipientName: 'Το ονοματεπώνυμο του παραλήπτη',
  lawyerName: 'Το ονοματεπώνυμο του δικηγόρου',
  lawFirmName: 'Η επωνυμία του δικηγορικού γραφείου',
  senderName: 'Το ονοματεπώνυμο του αποστολέα',
  caseDescription: 'Σύντομη περιγραφή της υπόθεσης',
  courtName: 'Το όνομα του δικαστηρίου (π.χ. Πρωτοδικείο Αθηνών)',
  courtDate: 'Η ημερομηνία της δικασίμου',
  courtTime: 'Η ώρα της δικασίμου',
  courtType: 'Το είδος του δικαστηρίου (π.χ. Ανακοπή, Αγωγή)',
  courtRoom: 'Η αίθουσα του δικαστηρίου',
  opponentName: 'Το ονοματεπώνυμο του αντιδίκου',
  originalDate: 'Η αρχική ημερομηνία',
  newDate: 'Η νέα ημερομηνία',
  postponementReason: 'Ο λόγος αναβολής',
  cancellationReason: 'Ο λόγος ματαίωσης',
  additionalInfo: 'Πρόσθετες πληροφορίες',
  additionalNotes: 'Πρόσθετες σημειώσεις',
  deadlineName: 'Το όνομα της προθεσμίας',
  deadlineDate: 'Η ημερομηνία λήξης της προθεσμίας',
  deadlineCategory: 'Η κατηγορία της προθεσμίας',
  daysRemaining: 'Οι ημέρες που απομένουν',
  daysOverdue: 'Οι ημέρες καθυστέρησης',
  appointmentDate: 'Η ημερομηνία του ραντεβού',
  appointmentTime: 'Η ώρα του ραντεβού',
  appointmentType: 'Ο τύπος του ραντεβού (δια ζώσης/διαδικτυακό)',
  appointmentLocation: 'Η τοποθεσία του ραντεβού',
  appointmentDuration: 'Η διάρκεια του ραντεβού σε λεπτά',
  meetingLink: 'Ο σύνδεσμος για διαδικτυακό ραντεβού',
  paymentInfo: 'Πληροφορίες πληρωμής',
  invoiceNumber: 'Ο αριθμός τιμολογίου',
  invoiceAmount: 'Το ποσό του τιμολογίου',
  invoiceDate: 'Η ημερομηνία έκδοσης',
  dueDate: 'Η ημερομηνία λήξης πληρωμής',
  invoiceDescription: 'Περιγραφή των χρεώσεων',
  paymentMethods: 'Οι διαθέσιμοι τρόποι πληρωμής',
  paymentAmount: 'Το ποσό που πληρώθηκε',
  paymentDate: 'Η ημερομηνία πληρωμής',
  paymentMethod: 'Ο τρόπος πληρωμής',
  accountBalance: 'Το υπόλοιπο του λογαριασμού',
  subject: 'Το θέμα του email',
  content: 'Το περιεχόμενο του μηνύματος',
  documentList: 'Η λίστα των απαιτούμενων εγγράφων',
  deadline: 'Η προθεσμία υποβολής',
  emailAddress: 'Η διεύθυνση email'
};

// Replace variables in template
export const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  });
  
  // Remove any remaining variables that weren't replaced
  result = result.replace(/{{[^}]+}}/g, '');
  
  return result;
};

// Get template by ID
export const getEmailTemplate = (templateId: string): EmailTemplate | undefined => {
  return emailTemplates.find(template => template.id === templateId);
};

// Get templates by category
export const getEmailTemplatesByCategory = (category: string): EmailTemplate[] => {
  return emailTemplates.filter(template => template.category === category);
};

// Extract variables from template
export const extractTemplateVariables = (template: string): string[] => {
  const regex = /{{([^}]+)}}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
};

// Validate email data
export const validateEmailData = (data: EmailData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check recipients
  if (!data.to || data.to.length === 0) {
    errors.push('Πρέπει να υπάρχει τουλάχιστον ένας παραλήπτης');
  }
  
  // Validate email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const allEmails = [
    ...data.to,
    ...(data.cc || []),
    ...(data.bcc || [])
  ];
  
  allEmails.forEach(email => {
    if (!emailRegex.test(email)) {
      errors.push(`Μη έγκυρη διεύθυνση email: ${email}`);
    }
  });
  
  // Check subject
  if (!data.subject || data.subject.trim() === '') {
    errors.push('Το θέμα του email είναι υποχρεωτικό');
  }
  
  // Check body
  if (!data.body || data.body.trim() === '') {
    errors.push('Το περιεχόμενο του email είναι υποχρεωτικό');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Format email for display
export const formatEmailDisplay = (data: EmailData): string => {
  const lines: string[] = [];
  
  lines.push(`Προς: ${data.to.join(', ')}`);
  
  if (data.cc && data.cc.length > 0) {
    lines.push(`Κοινοποίηση: ${data.cc.join(', ')}`);
  }
  
  if (data.bcc && data.bcc.length > 0) {
    lines.push(`Ιδιαίτερη κοινοποίηση: ${data.bcc.join(', ')}`);
  }
  
  lines.push(`Θέμα: ${data.subject}`);
  lines.push('');
  lines.push(data.body);
  
  if (data.attachments && data.attachments.length > 0) {
    lines.push('');
    lines.push('Συνημμένα:');
    data.attachments.forEach(attachment => {
      lines.push(`- ${attachment}`);
    });
  }
  
  return lines.join('\n');
};

// Create email from template
export const createEmailFromTemplate = (
  templateId: string,
  variables: Record<string, string>,
  recipients: {
    to: string[];
    cc?: string[];
    bcc?: string[];
  }
): EmailData | null => {
  const template = getEmailTemplate(templateId);
  
  if (!template) {
    console.error(`Template with id "${templateId}" not found`);
    return null;
  }
  
  const subject = replaceTemplateVariables(template.subject, variables);
  const body = replaceTemplateVariables(template.body, variables);
  
  return {
    ...recipients,
    subject,
    body,
    priority: 'normal'
  };
};

// Generate email preview HTML
export const generateEmailPreviewHTML = (data: EmailData): string => {
  const priorityColors = {
    low: '#28a745',
    normal: '#17a2b8',
    high: '#dc3545'
  };
  
  const priorityLabels = {
    low: 'Χαμηλή',
    normal: 'Κανονική',
    high: 'Υψηλή'
  };
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
      <div style="background-color: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd;">
        <div style="margin-bottom: 10px;">
          <strong>Προς:</strong> ${data.to.join(', ')}
        </div>
        ${data.cc && data.cc.length > 0 ? `
          <div style="margin-bottom: 10px;">
            <strong>Κοινοποίηση:</strong> ${data.cc.join(', ')}
          </div>
        ` : ''}
        ${data.bcc && data.bcc.length > 0 ? `
          <div style="margin-bottom: 10px;">
            <strong>Ιδιαίτερη κοινοποίηση:</strong> ${data.bcc.join(', ')}
          </div>
        ` : ''}
        <div style="margin-bottom: 10px;">
          <strong>Θέμα:</strong> ${data.subject}
        </div>
        ${data.priority ? `
          <div>
            <strong>Προτεραιότητα:</strong> 
            <span style="color: ${priorityColors[data.priority]}; font-weight: bold;">
              ${priorityLabels[data.priority]}
            </span>
          </div>
        ` : ''}
      </div>
      <div style="padding: 20px; white-space: pre-wrap; line-height: 1.6;">
        ${data.body}
      </div>
      ${data.attachments && data.attachments.length > 0 ? `
        <div style="background-color: #f8f9fa; padding: 15px; border-top: 1px solid #ddd;">
          <strong>Συνημμένα:</strong>
          <ul style="margin: 5px 0 0 20px; padding: 0;">
            ${data.attachments.map(attachment => `<li>${attachment}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
};

// Format date for email
export const formatDateForEmail = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE d MMMM yyyy', { locale: el });
};

// Format time for email
export const formatTimeForEmail = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm', { locale: el });
};

// Generate email signature
export const generateEmailSignature = (
  lawyerName: string,
  lawFirmName: string,
  contact?: {
    phone?: string;
    mobile?: string;
    email?: string;
    address?: string;
    website?: string;
  }
): string => {
  let signature = `\n\nΜε εκτίμηση,\n${lawyerName}\n${lawFirmName}`;
  
  if (contact) {
    signature += '\n';
    
    if (contact.phone) {
      signature += `\nΤηλ: ${contact.phone}`;
    }
    
    if (contact.mobile) {
      signature += `\nΚιν: ${contact.mobile}`;
    }
    
    if (contact.email) {
      signature += `\nEmail: ${contact.email}`;
    }
    
    if (contact.address) {
      signature += `\nΔιεύθυνση: ${contact.address}`;
    }
    
    if (contact.website) {
      signature += `\nWebsite: ${contact.website}`;
    }
  }
  
  return signature;
};

// Save email template
export const saveCustomTemplate = (template: EmailTemplate): void => {
  const customTemplates = getCustomTemplates();
  const existingIndex = customTemplates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    customTemplates[existingIndex] = template;
  } else {
    customTemplates.push(template);
  }
  
  localStorage.setItem('customEmailTemplates', JSON.stringify(customTemplates));
};

// Get custom templates
export const getCustomTemplates = (): EmailTemplate[] => {
  const stored = localStorage.getItem('customEmailTemplates');
  return stored ? JSON.parse(stored) : [];
};

// Delete custom template
export const deleteCustomTemplate = (templateId: string): void => {
  const customTemplates = getCustomTemplates();
  const filtered = customTemplates.filter(t => t.id !== templateId);
  localStorage.setItem('customEmailTemplates', JSON.stringify(filtered));
};

// Get all templates (predefined + custom)
export const getAllTemplates = (): EmailTemplate[] => {
  return [...emailTemplates, ...getCustomTemplates()];
};
