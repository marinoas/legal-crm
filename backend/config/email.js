const nodemailer = require('nodemailer');

// Email configuration based on provider
const emailConfigs = {
  smtp: {
    createTransporter: (settings) => {
      return nodemailer.createTransporter({
        host: settings.smtp.host,
        port: settings.smtp.port,
        secure: settings.smtp.secure,
        auth: {
          user: settings.smtp.auth.user,
          pass: settings.smtp.auth.pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });
    }
  },
  
  gmail: {
    createTransporter: (settings) => {
      return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: settings.gmail.user,
          pass: settings.gmail.pass
        }
      });
    }
  },
  
  outlook: {
    createTransporter: (settings) => {
      return nodemailer.createTransporter({
        service: 'hotmail',
        auth: {
          user: settings.outlook.user,
          pass: settings.outlook.pass
        }
      });
    }
  },
  
  sendgrid: {
    createTransporter: (settings) => {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(settings.sendgrid.apiKey);
      
      // Return a nodemailer-compatible interface
      return {
        sendMail: async (mailOptions) => {
          const msg = {
            to: mailOptions.to,
            from: mailOptions.from || settings.sendgrid.fromEmail,
            subject: mailOptions.subject,
            text: mailOptions.text,
            html: mailOptions.html,
            attachments: mailOptions.attachments?.map(att => ({
              content: att.content,
              filename: att.filename,
              type: att.contentType,
              disposition: 'attachment'
            }))
          };
          
          const [response] = await sgMail.send(msg);
          return response;
        }
      };
    }
  },
  
  mailgun: {
    createTransporter: (settings) => {
      const mailgun = require('mailgun-js');
      const mg = mailgun({
        apiKey: settings.mailgun.apiKey,
        domain: settings.mailgun.domain,
        host: settings.mailgun.host || 'api.mailgun.net'
      });
      
      // Return a nodemailer-compatible interface
      return {
        sendMail: async (mailOptions) => {
          const data = {
            from: mailOptions.from || settings.mailgun.fromEmail,
            to: mailOptions.to,
            subject: mailOptions.subject,
            text: mailOptions.text,
            html: mailOptions.html,
            attachment: mailOptions.attachments
          };
          
          return new Promise((resolve, reject) => {
            mg.messages().send(data, (error, body) => {
              if (error) reject(error);
              else resolve(body);
            });
          });
        }
      };
    }
  }
};

// Default email templates
const defaultTemplates = {
  base: `
    <!DOCTYPE html>
    <html lang="el">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #1976d2;
          padding-bottom: 20px;
        }
        .logo {
          max-width: 200px;
          height: auto;
        }
        .content {
          margin: 30px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #1976d2;
          color: white !important;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
          font-weight: 500;
        }
        .button:hover {
          background-color: #1565c0;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 12px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .info {
          background-color: #e3f2fd;
          border: 1px solid #90caf9;
          color: #1565c0;
          padding: 12px;
          border-radius: 4px;
          margin: 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        {{content}}
      </div>
    </body>
    </html>
  `,
  
  header: (lawFirmName, logoUrl) => `
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${lawFirmName}" class="logo">` : ''}
      <h1 style="color: #1976d2; margin: 10px 0;">${lawFirmName}</h1>
    </div>
  `,
  
  footer: (lawFirmName, contact) => `
    <div class="footer">
      <p><strong>${lawFirmName}</strong></p>
      ${contact.address ? `<p>${contact.address}</p>` : ''}
      ${contact.phone ? `<p>Τηλ: ${contact.phone}</p>` : ''}
      ${contact.email ? `<p>Email: ${contact.email}</p>` : ''}
      ${contact.website ? `<p>Web: ${contact.website}</p>` : ''}
      <p style="margin-top: 20px; font-size: 11px; color: #999;">
        Αυτό το μήνυμα είναι εμπιστευτικό και προορίζεται αποκλειστικά για τον παραλήπτη.
        Εάν λάβατε αυτό το μήνυμα από λάθος, παρακαλούμε ενημερώστε μας και διαγράψτε το.
      </p>
    </div>
  `,
  
  button: (text, url) => `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${url}" class="button">${text}</a>
    </div>
  `,
  
  table: (headers, rows) => `
    <table>
      <thead>
        <tr>
          ${headers.map(h => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
};

// Email builder class
class EmailBuilder {
  constructor(settings) {
    this.settings = settings;
    this.content = '';
  }
  
  setHeader(lawFirmName, logoUrl) {
    this.header = defaultTemplates.header(lawFirmName, logoUrl);
    return this;
  }
  
  setFooter(lawFirmName, contact) {
    this.footer = defaultTemplates.footer(lawFirmName, contact);
    return this;
  }
  
  addContent(html) {
    this.content += html;
    return this;
  }
  
  addParagraph(text) {
    this.content += `<p>${text}</p>`;
    return this;
  }
  
  addHeading(text, level = 2) {
    this.content += `<h${level}>${text}</h${level}>`;
    return this;
  }
  
  addButton(text, url) {
    this.content += defaultTemplates.button(text, url);
    return this;
  }
  
  addWarning(text) {
    this.content += `<div class="warning">${text}</div>`;
    return this;
  }
  
  addInfo(text) {
    this.content += `<div class="info">${text}</div>`;
    return this;
  }
  
  addTable(headers, rows) {
    this.content += defaultTemplates.table(headers, rows);
    return this;
  }
  
  addList(items, ordered = false) {
    const tag = ordered ? 'ol' : 'ul';
    this.content += `<${tag}>${items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;
    return this;
  }
  
  addDivider() {
    this.content += '<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">';
    return this;
  }
  
  build() {
    let html = defaultTemplates.base;
    let content = '';
    
    if (this.header) content += this.header;
    content += '<div class="content">' + this.content + '</div>';
    if (this.footer) content += this.footer;
    
    html = html.replace('{{content}}', content);
    return html;
  }
}

// Email queue for retry logic
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }
  
  async add(emailData) {
    this.queue.push({
      ...emailData,
      attempts: 0,
      status: 'pending'
    });
    
    if (!this.processing) {
      this.process();
    }
  }
  
  async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const email = this.queue.shift();
      
      try {
        await this.send(email);
        email.status = 'sent';
        console.log(`Email sent successfully to ${email.to}`);
      } catch (error) {
        email.attempts++;
        console.error(`Email failed to ${email.to}:`, error.message);
        
        if (email.attempts < this.maxRetries) {
          email.status = 'retry';
          setTimeout(() => {
            this.queue.push(email);
            if (!this.processing) this.process();
          }, this.retryDelay * email.attempts);
        } else {
          email.status = 'failed';
          console.error(`Email permanently failed to ${email.to} after ${this.maxRetries} attempts`);
        }
      }
    }
    
    this.processing = false;
  }
  
  async send(email) {
    const { transporter, ...mailOptions } = email;
    return await transporter.sendMail(mailOptions);
  }
}

// Initialize email service
const initializeEmailService = async (settings) => {
  if (!settings || !settings.email || !settings.email.enabled) {
    console.log('Email service is disabled');
    return null;
  }
  
  const provider = settings.email.provider;
  const config = emailConfigs[provider];
  
  if (!config) {
    throw new Error(`Unsupported email provider: ${provider}`);
  }
  
  try {
    const transporter = config.createTransporter(settings.email);
    
    // Verify connection
    if (transporter.verify) {
      await transporter.verify();
      console.log(`Email service connected successfully using ${provider}`);
    }
    
    return transporter;
  } catch (error) {
    console.error(`Failed to initialize email service:`, error);
    throw error;
  }
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize HTML content
const sanitizeHtml = (html) => {
  const DOMPurify = require('isomorphic-dompurify');
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                   'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
                   'div', 'span', 'img', 'hr'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class']
  });
};

module.exports = {
  emailConfigs,
  defaultTemplates,
  EmailBuilder,
  EmailQueue,
  initializeEmailService,
  validateEmail,
  sanitizeHtml
};
