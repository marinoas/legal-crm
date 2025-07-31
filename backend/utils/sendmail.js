const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

const sendEmail = async (options) => {
  try {
    // Get email settings
    const settings = await Settings.getByCategory('email');
    const emailSettings = settings.email;

    if (!emailSettings) {
      throw new Error('Email settings not configured');
    }

    let transporter;

    // Create transporter based on provider
    if (emailSettings.provider === 'smtp') {
      transporter = nodemailer.createTransport({
        host: emailSettings.smtp.host || process.env.EMAIL_HOST,
        port: emailSettings.smtp.port || process.env.EMAIL_PORT,
        secure: emailSettings.smtp.secure,
        auth: {
          user: emailSettings.smtp.auth.user || process.env.EMAIL_USER,
          pass: emailSettings.smtp.auth.pass || process.env.EMAIL_PASS
        }
      });
    } else {
      // Handle other providers (sendgrid, mailgun, ses)
      throw new Error(`Email provider ${emailSettings.provider} not implemented yet`);
    }

    // Email options
    const mailOptions = {
      from: options.from || `${emailSettings.fromName || process.env.EMAIL_FROM} <${emailSettings.fromEmail || process.env.EMAIL_USER}>`,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: options.html || formatEmailTemplate(options.text, options.template),
      attachments: options.attachments,
      replyTo: options.replyTo || emailSettings.replyTo
    };

    // Add signature if available
    if (emailSettings.signature && !options.noSignature) {
      if (mailOptions.html) {
        mailOptions.html += `<br><br><div style="border-top: 1px solid #ccc; padding-top: 10px; margin-top: 20px;">${emailSettings.signature}</div>`;
      } else {
        mailOptions.text += `\n\n--\n${emailSettings.signature}`;
      }
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Αποτυχία αποστολής email: ${error.message}`);
  }
};

// Format email with template
const formatEmailTemplate = (content, templateName) => {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #1976d2;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f5f5f5;
          padding: 20px;
          border-radius: 0 0 5px 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #1976d2;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        }
        .info-box {
          background-color: #e3f2fd;
          border-left: 4px solid #1976d2;
          padding: 10px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>${process.env.BUSINESS_NAME || 'Δικηγορικό Γραφείο'}</h2>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${process.env.BUSINESS_NAME || 'Δικηγορικό Γραφείο'}. Όλα τα δικαιώματα κατοχυρωμένα.</p>
        <p>${process.env.BUSINESS_ADDRESS || ''}</p>
        <p>Τηλ: ${process.env.BUSINESS_PHONE || ''} | Email: ${process.env.BUSINESS_EMAIL || ''}</p>
      </div>
    </body>
    </html>
  `;

  return baseTemplate;
};

// Send email with template
const sendTemplateEmail = async (to, templateName, variables = {}) => {
  try {
    const settings = await Settings.getByCategory('email');
    const template = settings.email.templates[templateName];

    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Replace variables in template
    let subject = template.subject || '';
    let body = template.body || template;

    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, variables[key]);
      body = body.replace(regex, variables[key]);
    });

    return await sendEmail({
      to,
      subject,
      html: body,
      template: templateName
    });
  } catch (error) {
    console.error('Template email error:', error);
    throw error;
  }
};

// Send bulk emails
const sendBulkEmails = async (recipients, options) => {
  const results = {
    successful: [],
    failed: []
  };

  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        ...options,
        to: recipient.email || recipient
      });
      results.successful.push({
        email: recipient.email || recipient,
        messageId: result.messageId
      });
    } catch (error) {
      results.failed.push({
        email: recipient.email || recipient,
        error: error.message
      });
    }
  }

  return results;
};

// Email templates
const emailTemplates = {
  // Appointment confirmation
  appointmentConfirmation: (appointment, client) => ({
    subject: 'Επιβεβαίωση Ραντεβού',
    html: `
      <h3>Επιβεβαίωση Ραντεβού</h3>
      <p>Αγαπητέ/ή ${client.fullName},</p>
      <p>Το ραντεβού σας έχει επιβεβαιωθεί με τις εξής λεπτομέρειες:</p>
      <div class="info-box">
        <p><strong>Ημερομηνία:</strong> ${appointment.formattedDate}</p>
        <p><strong>Ώρα:</strong> ${appointment.formattedTime}</p>
        <p><strong>Τύπος:</strong> ${appointment.type === 'online' ? 'Διαδικτυακό' : 'Δια ζώσης'}</p>
        ${appointment.location ? `<p><strong>Τοποθεσία:</strong> ${appointment.location}</p>` : ''}
        ${appointment.onlineMeetingUrl ? `<p><strong>Σύνδεσμος συνάντησης:</strong> <a href="${appointment.onlineMeetingUrl}">${appointment.onlineMeetingUrl}</a></p>` : ''}
      </div>
      <p>Σε περίπτωση που χρειάζεται να αλλάξετε ή να ακυρώσετε το ραντεβού σας, παρακαλώ επικοινωνήστε μαζί μας τουλάχιστον 24 ώρες πριν.</p>
      <p>Με εκτίμηση,<br>${process.env.BUSINESS_NAME}</p>
    `
  }),

  // Court notification
  courtScheduled: (court, client) => ({
    subject: `Προγραμματισμός Δικασίμου - ${court.caseTitle}`,
    html: `
      <h3>Ενημέρωση Δικασίμου</h3>
      <p>Αγαπητέ/ή ${client.fullName},</p>
      <p>Σας ενημερώνουμε ότι η υπόθεσή σας έχει προγραμματιστεί:</p>
      <div class="info-box">
        <p><strong>Δικαστήριο:</strong> ${court.courtFullName}</p>
        <p><strong>Υπόθεση:</strong> ${court.caseTitle}</p>
        <p><strong>Ημερομηνία:</strong> ${new Date(court.hearingDate).toLocaleDateString('el-GR')}</p>
        ${court.hearingTime ? `<p><strong>Ώρα:</strong> ${court.hearingTime}</p>` : ''}
        <p><strong>Αντίδικος:</strong> ${court.opponent.name}</p>
      </div>
      <p>Θα επικοινωνήσουμε μαζί σας για την προετοιμασία της υπόθεσης.</p>
      <p>Με εκτίμηση,<br>${process.env.BUSINESS_NAME}</p>
    `
  }),

  // Deadline reminder
  deadlineReminder: (deadline, client, daysUntil) => ({
    subject: `Υπενθύμιση Προθεσμίας: ${deadline.name}`,
    html: `
      <h3>Υπενθύμιση Προθεσμίας</h3>
      <p>Αγαπητέ/ή ${client.fullName},</p>
      <p>Σας υπενθυμίζουμε ότι η παρακάτω προθεσμία λήγει ${daysUntil === 0 ? 'σήμερα' : `σε ${daysUntil} ημέρες`}:</p>
      <div class="info-box">
        <p><strong>Προθεσμία:</strong> ${deadline.name}</p>
        <p><strong>Ημερομηνία λήξης:</strong> ${new Date(deadline.dueDate).toLocaleDateString('el-GR')}</p>
        ${deadline.description ? `<p><strong>Περιγραφή:</strong> ${deadline.description}</p>` : ''}
      </div>
      <p>Παρακαλώ επικοινωνήστε μαζί μας αν χρειάζεστε περισσότερες πληροφορίες.</p>
      <p>Με εκτίμηση,<br>${process.env.BUSINESS_NAME}</p>
    `
  }),

  // Name day wishes
  nameDayWishes: (contact) => ({
    subject: 'Χρόνια Πολλά!',
    html: `
      <h3>Χρόνια Πολλά!</h3>
      <p>Αγαπητέ/ή ${contact.fullName},</p>
      <p>Με την ευκαιρία της ονομαστικής σας εορτής, σας ευχόμαστε χρόνια πολλά, υγεία και ευτυχία!</p>
      <p>Με εκτίμηση,<br>${process.env.BUSINESS_NAME}</p>
    `
  }),

  // Birthday wishes
  birthdayWishes: (contact) => ({
    subject: 'Χρόνια Πολλά για τα γενέθλιά σας!',
    html: `
      <h3>Χρόνια Πολλά!</h3>
      <p>Αγαπητέ/ή ${contact.fullName},</p>
      <p>Με την ευκαιρία των γενεθλίων σας, σας ευχόμαστε χρόνια πολλά, υγεία, ευτυχία και κάθε επιτυχία!</p>
      <p>Με εκτίμηση,<br>${process.env.BUSINESS_NAME}</p>
    `
  })
};

module.exports = {
  sendEmail,
  sendTemplateEmail,
  sendBulkEmails,
  emailTemplates
};
