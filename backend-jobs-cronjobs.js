const cron = require('node-cron');
const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Models
const User = require('../models/User');
const Court = require('../models/Court');
const Deadline = require('../models/Deadline');
const Appointment = require('../models/Appointment');
const Pending = require('../models/Pending');
const Contact = require('../models/Contact');
const Settings = require('../models/Settings');
const CommunicationTemplate = require('../models/CommunicationTemplate');

// Utils
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');
const { createBackup } = require('../utils/backup');

// Set timezone to Athens
moment.tz.setDefault('Europe/Athens');

// Job status tracking
const jobStatus = {
  deadlineReminders: { running: false, lastRun: null, errors: [] },
  courtReminders: { running: false, lastRun: null, errors: [] },
  appointmentReminders: { running: false, lastRun: null, errors: [] },
  birthdayWishes: { running: false, lastRun: null, errors: [] },
  autoBackup: { running: false, lastRun: null, errors: [] },
  pendingReminders: { running: false, lastRun: null, errors: [] },
  systemCleanup: { running: false, lastRun: null, errors: [] }
};

// Helper function to log job execution
const logJob = (jobName, message, isError = false) => {
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log(`[${timestamp}] [${jobName}] ${message}`);
  
  if (isError) {
    jobStatus[jobName].errors.push({ timestamp, message });
    // Keep only last 100 errors
    if (jobStatus[jobName].errors.length > 100) {
      jobStatus[jobName].errors = jobStatus[jobName].errors.slice(-100);
    }
  }
};

// 1. Deadline Reminders - Run every day at 9:00 AM
const deadlineRemindersJob = cron.schedule('0 9 * * *', async () => {
  const jobName = 'deadlineReminders';
  
  if (jobStatus[jobName].running) {
    logJob(jobName, 'Job already running, skipping...');
    return;
  }
  
  jobStatus[jobName].running = true;
  logJob(jobName, 'Starting deadline reminders job...');
  
  try {
    const users = await User.find({ isActive: true }).populate('settings');
    
    for (const user of users) {
      try {
        const settings = await Settings.findOne({ user: user._id });
        if (!settings?.notifications?.deadlineReminders?.enabled) continue;
        
        const reminderDays = settings.notifications.deadlineReminders.daysBefore || [30, 15, 7, 3, 1];
        const today = moment().startOf('day');
        
        // Get all active deadlines for this user
        const deadlines = await Deadline.find({
          user: user._id,
          status: { $in: ['pending', 'urgent'] },
          dueDate: { $gte: today.toDate() }
        }).populate('client court');
        
        for (const deadline of deadlines) {
          const daysUntilDue = moment(deadline.dueDate).diff(today, 'days');
          
          if (reminderDays.includes(daysUntilDue)) {
            // Get template or use default
            let template = await CommunicationTemplate.findOne({
              user: user._id,
              category: 'deadline',
              isDefault: true
            });
            
            if (!template) {
              template = {
                render: () => ({
                  subject: `Υπενθύμιση Προθεσμίας: ${deadline.name}`,
                  body: `Η προθεσμία "${deadline.name}" λήγει σε ${daysUntilDue} ημέρες (${moment(deadline.dueDate).format('DD/MM/YYYY')}).`
                })
              };
            }
            
            const rendered = template.render({
              deadlineName: deadline.name,
              daysRemaining: daysUntilDue,
              deadlineDate: moment(deadline.dueDate).format('DD/MM/YYYY'),
              clientName: deadline.client ? `${deadline.client.firstName} ${deadline.client.lastName}` : '',
              lawyerName: `${user.firstName} ${user.lastName}`
            });
            
            // Send email reminder
            if (settings.notifications.deadlineReminders.email) {
              await sendEmail({
                email: user.email,
                subject: rendered.subject,
                message: rendered.body
              });
            }
            
            // Send SMS reminder if enabled
            if (settings.notifications.deadlineReminders.sms && user.mobile) {
              await sendSMS({
                to: user.mobile,
                body: rendered.smsBody || `Προθεσμία "${deadline.name}" λήγει σε ${daysUntilDue} ημέρες.`
              });
            }
            
            // Update deadline with last reminder sent
            deadline.lastReminderSent = new Date();
            await deadline.save();
            
            logJob(jobName, `Sent reminder for deadline "${deadline.name}" to ${user.email}`);
          }
        }
      } catch (error) {
        logJob(jobName, `Error processing user ${user.email}: ${error.message}`, true);
      }
    }
    
    jobStatus[jobName].lastRun = new Date();
    logJob(jobName, 'Deadline reminders job completed');
  } catch (error) {
    logJob(jobName, `Job failed: ${error.message}`, true);
  } finally {
    jobStatus[jobName].running = false;
  }
}, {
  scheduled: true,
  timezone: "Europe/Athens"
});

// 2. Court Reminders - Run every day at 8:00 AM and 6:00 PM
const courtRemindersJob = cron.schedule('0 8,18 * * *', async () => {
  const jobName = 'courtReminders';
  
  if (jobStatus[jobName].running) {
    logJob(jobName, 'Job already running, skipping...');
    return;
  }
  
  jobStatus[jobName].running = true;
  logJob(jobName, 'Starting court reminders job...');
  
  try {
    const users = await User.find({ isActive: true });
    
    for (const user of users) {
      try {
        const settings = await Settings.findOne({ user: user._id });
        if (!settings?.notifications?.courtReminders?.enabled) continue;
        
        const reminderDays = settings.notifications.courtReminders.daysBefore || [7, 3, 1];
        const today = moment().startOf('day');
        
        // Get upcoming courts
        const courts = await Court.find({
          user: user._id,
          status: 'scheduled',
          date: { 
            $gte: today.toDate(),
            $lte: moment().add(30, 'days').toDate()
          }
        }).populate('client');
        
        for (const court of courts) {
          const daysUntilCourt = moment(court.date).diff(today, 'days');
          
          // Check if it's tomorrow and we're in the evening run
          const isTomorrow = daysUntilCourt === 1 && moment().hour() >= 18;
          
          if (reminderDays.includes(daysUntilCourt) || isTomorrow) {
            // Get template
            const template = await CommunicationTemplate.findOne({
              user: user._id,
              category: 'court',
              name: { $regex: 'υπενθύμιση', $options: 'i' }
            }) || {
              render: () => ({
                subject: 'Υπενθύμιση Δικαστηρίου',
                body: `Υπενθυμίζουμε το δικαστήριο σας ${moment(court.date).format('DD/MM/YYYY')} στο ${court.court}.`
              })
            };
            
            const rendered = template.render({
              court: court.court,
              date: moment(court.date).format('DD/MM/YYYY'),
              time: court.time || '',
              courtType: court.type,
              clientName: court.client ? `${court.client.firstName} ${court.client.lastName}` : '',
              opponent: court.opponent,
              lawyerName: `${user.firstName} ${user.lastName}`
            });
            
            // Send reminder to lawyer
            await sendEmail({
              email: user.email,
              subject: rendered.subject,
              message: rendered.body
            });
            
            // Send reminder to client if enabled
            if (settings.notifications.courtReminders.notifyClient && court.client?.email) {
              const clientTemplate = await CommunicationTemplate.findOne({
                user: user._id,
                category: 'court',
                name: { $regex: 'εντολέα', $options: 'i' }
              });
              
              if (clientTemplate) {
                const clientRendered = clientTemplate.render({
                  clientName: `${court.client.firstName} ${court.client.lastName}`,
                  court: court.court,
                  date: moment(court.date).format('DD/MM/YYYY'),
                  time: court.time || '',
                  courtType: court.type,
                  lawyerName: `${user.firstName} ${user.lastName}`,
                  lawFirmName: user.lawFirmName || ''
                });
                
                await sendEmail({
                  email: court.client.email,
                  subject: clientRendered.subject,
                  message: clientRendered.body
                });
              }
            }
            
            logJob(jobName, `Sent court reminder for ${court.court} on ${moment(court.date).format('DD/MM/YYYY')}`);
          }
        }
      } catch (error) {
        logJob(jobName, `Error processing user ${user.email}: ${error.message}`, true);
      }
    }
    
    jobStatus[jobName].lastRun = new Date();
    logJob(jobName, 'Court reminders job completed');
  } catch (error) {
    logJob(jobName, `Job failed: ${error.message}`, true);
  } finally {
    jobStatus[jobName].running = false;
  }
}, {
  scheduled: true,
  timezone: "Europe/Athens"
});

// 3. Appointment Reminders - Run every hour
const appointmentRemindersJob = cron.schedule('0 * * * *', async () => {
  const jobName = 'appointmentReminders';
  
  if (jobStatus[jobName].running) {
    logJob(jobName, 'Job already running, skipping...');
    return;
  }
  
  jobStatus[jobName].running = true;
  logJob(jobName, 'Starting appointment reminders job...');
  
  try {
    const now = moment();
    const reminderWindow = moment().add(24, 'hours');
    
    // Get appointments in the next 24 hours that haven't been reminded
    const appointments = await Appointment.find({
      date: {
        $gte: now.toDate(),
        $lte: reminderWindow.toDate()
      },
      status: 'scheduled',
      reminderSent: { $ne: true }
    }).populate('client user');
    
    for (const appointment of appointments) {
      try {
        const settings = await Settings.findOne({ user: appointment.user._id });
        if (!settings?.notifications?.appointmentReminders?.enabled) continue;
        
        const hoursUntil = moment(appointment.date).diff(now, 'hours');
        const reminderHours = settings.notifications.appointmentReminders.hoursBefore || [24, 2];
        
        if (reminderHours.includes(hoursUntil)) {
          // Get template
          const template = await CommunicationTemplate.findOne({
            user: appointment.user._id,
            category: 'appointment',
            name: { $regex: 'υπενθύμιση', $options: 'i' }
          });
          
          if (template && appointment.client?.email) {
            const rendered = template.render({
              clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
              date: moment(appointment.date).format('DD/MM/YYYY'),
              time: moment(appointment.date).format('HH:mm'),
              meetingType: appointment.type === 'online' ? 'Διαδικτυακό ραντεβού' : 'Δια ζώσης ραντεβού',
              meetingLocation: appointment.type === 'online' ? appointment.meetingLink : appointment.location,
              duration: appointment.duration,
              lawyerName: `${appointment.user.firstName} ${appointment.user.lastName}`,
              phone: appointment.user.phone || ''
            });
            
            await sendEmail({
              email: appointment.client.email,
              subject: rendered.subject,
              message: rendered.body
            });
            
            // Send SMS if enabled
            if (settings.notifications.appointmentReminders.sms && appointment.client.mobile) {
              await sendSMS({
                to: appointment.client.mobile,
                body: rendered.smsBody || `Υπενθύμιση ραντεβού: ${moment(appointment.date).format('DD/MM HH:mm')}`
              });
            }
            
            // Mark as reminded
            appointment.reminderSent = true;
            await appointment.save();
            
            logJob(jobName, `Sent appointment reminder to ${appointment.client.email}`);
          }
        }
      } catch (error) {
        logJob(jobName, `Error processing appointment ${appointment._id}: ${error.message}`, true);
      }
    }
    
    jobStatus[jobName].lastRun = new Date();
    logJob(jobName, 'Appointment reminders job completed');
  } catch (error) {
    logJob(jobName, `Job failed: ${error.message}`, true);
  } finally {
    jobStatus[jobName].running = false;
  }
}, {
  scheduled: true,
  timezone: "Europe/Athens"
});

// 4. Birthday/Name Day Wishes - Run daily at 10:00 AM
const birthdayWishesJob = cron.schedule('0 10 * * *', async () => {
  const jobName = 'birthdayWishes';
  
  if (jobStatus[jobName].running) {
    logJob(jobName, 'Job already running, skipping...');
    return;
  }
  
  jobStatus[jobName].running = true;
  logJob(jobName, 'Starting birthday/name day wishes job...');
  
  try {
    const today = moment();
    const day = today.date();
    const month = today.month() + 1;
    
    const users = await User.find({ isActive: true });
    
    for (const user of users) {
      try {
        const settings = await Settings.findOne({ user: user._id });
        if (!settings?.notifications?.celebrations?.enabled) continue;
        
        // Find contacts celebrating today
        const celebrants = await Contact.find({
          user: user._id,
          'nameDay.day': day,
          'nameDay.month': month
        });
        
        if (celebrants.length > 0) {
          // Create pending task for the user
          await Pending.create({
            user: user._id,
            name: `Ευχές ονομαστικής εορτής (${celebrants.length} άτομα)`,
            description: `Εορτάζουν σήμερα: ${celebrants.map(c => `${c.firstName} ${c.lastName}`).join(', ')}`,
            dueDate: today.endOf('day').toDate(),
            priority: 'low',
            relatedContacts: celebrants.map(c => c._id)
          });
          
          logJob(jobName, `Created celebration reminder for ${user.email} - ${celebrants.length} contacts`);
          
          // Auto-send if enabled
          if (settings.notifications.celebrations.autoSend) {
            const template = await CommunicationTemplate.findOne({
              user: user._id,
              category: 'celebration',
              isDefault: true
            });
            
            if (template) {
              for (const celebrant of celebrants) {
                if (celebrant.email) {
                  const rendered = template.render({
                    recipientName: `${celebrant.firstName} ${celebrant.lastName}`,
                    senderName: `${user.firstName} ${user.lastName}`,
                    lawFirmName: user.lawFirmName || ''
                  });
                  
                  await sendEmail({
                    email: celebrant.email,
                    subject: rendered.subject,
                    message: rendered.body
                  });
                  
                  logJob(jobName, `Sent celebration wishes to ${celebrant.email}`);
                }
              }
            }
          }
        }
      } catch (error) {
        logJob(jobName, `Error processing user ${user.email}: ${error.message}`, true);
      }
    }
    
    jobStatus[jobName].lastRun = new Date();
    logJob(jobName, 'Birthday/name day wishes job completed');
  } catch (error) {
    logJob(jobName, `Job failed: ${error.message}`, true);
  } finally {
    jobStatus[jobName].running = false;
  }
}, {
  scheduled: true,
  timezone: "Europe/Athens"
});

// 5. Automatic Backup - Run based on user settings
const autoBackupJob = cron.schedule('0 3 * * *', async () => {
  const jobName = 'autoBackup';
  
  if (jobStatus[jobName].running) {
    logJob(jobName, 'Job already running, skipping...');
    return;
  }
  
  jobStatus[jobName].running = true;
  logJob(jobName, 'Starting automatic backup job...');
  
  try {
    const now = moment();
    
    // Find users with backup scheduled for today
    const settings = await Settings.find({
      'backupSchedule.enabled': true,
      'backupSchedule.nextRun': { $lte: now.toDate() }
    }).populate('user');
    
    for (const setting of settings) {
      try {
        // Create backup
        await createBackup(setting.user._id);
        
        // Update next run time
        const { frequency, time } = setting.backupSchedule;
        const [hours, minutes] = time.split(':').map(Number);
        const nextRun = moment().hours(hours).minutes(minutes);
        
        switch (frequency) {
          case 'daily':
            nextRun.add(1, 'day');
            break;
          case 'weekly':
            nextRun.add(1, 'week');
            break;
          case 'monthly':
            nextRun.add(1, 'month');
            break;
        }
        
        setting.backupSchedule.lastRun = now.toDate();
        setting.backupSchedule.nextRun = nextRun.toDate();
        await setting.save();
        
        logJob(jobName, `Created backup for user ${setting.user.email}`);
        
        // Send notification
        await sendEmail({
          email: setting.user.email,
          subject: 'Αυτόματο αντίγραφο ασφαλείας ολοκληρώθηκε',
          message: `Το αυτόματο αντίγραφο ασφαλείας των δεδομένων σας δημιουργήθηκε επιτυχώς στις ${now.format('DD/MM/YYYY HH:mm')}.`
        });
      } catch (error) {
        logJob(jobName, `Error backing up for user ${setting.user.email}: ${error.message}`, true);
      }
    }
    
    jobStatus[jobName].lastRun = new Date();
    logJob(jobName, 'Automatic backup job completed');
  } catch (error) {
    logJob(jobName, `Job failed: ${error.message}`, true);
  } finally {
    jobStatus[jobName].running = false;
  }
}, {
  scheduled: true,
  timezone: "Europe/Athens"
});

// 6. Pending Tasks Reminders - Run every day at 8:30 AM
const pendingRemindersJob = cron.schedule('30 8 * * *', async () => {
  const jobName = 'pendingReminders';
  
  if (jobStatus[jobName].running) {
    logJob(jobName, 'Job already running, skipping...');
    return;
  }
  
  jobStatus[jobName].running = true;
  logJob(jobName, 'Starting pending tasks reminders job...');
  
  try {
    const today = moment().startOf('day');
    const users = await User.find({ isActive: true });
    
    for (const user of users) {
      try {
        const settings = await Settings.findOne({ user: user._id });
        if (!settings?.notifications?.pendingReminders?.enabled) continue;
        
        // Get overdue and due today pending tasks
        const pendings = await Pending.find({
          user: user._id,
          status: 'pending',
          dueDate: { $lte: today.endOf('day').toDate() }
        }).populate('client');
        
        if (pendings.length > 0) {
          const overdue = pendings.filter(p => moment(p.dueDate).isBefore(today));
          const dueToday = pendings.filter(p => moment(p.dueDate).isSame(today, 'day'));
          
          let message = `Καλημέρα ${user.firstName},\n\n`;
          
          if (overdue.length > 0) {
            message += `Έχετε ${overdue.length} εκκρεμότητες που έχουν ξεπεράσει την προθεσμία:\n`;
            overdue.forEach(p => {
              const daysOverdue = today.diff(moment(p.dueDate), 'days');
              message += `- ${p.name} (${daysOverdue} ημέρες καθυστέρηση)\n`;
            });
            message += '\n';
          }
          
          if (dueToday.length > 0) {
            message += `Έχετε ${dueToday.length} εκκρεμότητες που λήγουν σήμερα:\n`;
            dueToday.forEach(p => {
              message += `- ${p.name}\n`;
            });
          }
          
          message += '\nΠαρακαλώ συνδεθείτε στο σύστημα για περισσότερες λεπτομέρειες.';
          
          await sendEmail({
            email: user.email,
            subject: `Εκκρεμότητες - ${overdue.length} καθυστερημένες, ${dueToday.length} λήγουν σήμερα`,
            message
          });
          
          logJob(jobName, `Sent pending reminders to ${user.email}`);
        }
      } catch (error) {
        logJob(jobName, `Error processing user ${user.email}: ${error.message}`, true);
      }
    }
    
    jobStatus[jobName].lastRun = new Date();
    logJob(jobName, 'Pending tasks reminders job completed');
  } catch (error) {
    logJob(jobName, `Job failed: ${error.message}`, true);
  } finally {
    jobStatus[jobName].running = false;
  }
}, {
  scheduled: true,
  timezone: "Europe/Athens"
});

// 7. System Cleanup - Run weekly on Sunday at 4:00 AM
const systemCleanupJob = cron.schedule('0 4 * * 0', async () => {
  const jobName = 'systemCleanup';
  
  if (jobStatus[jobName].running) {
    logJob(jobName, 'Job already running, skipping...');
    return;
  }
  
  jobStatus[jobName].running = true;
  logJob(jobName, 'Starting system cleanup job...');
  
  try {
    // Clean up old completed tasks (older than 1 year)
    const oneYearAgo = moment().subtract(1, 'year').toDate();
    
    const deletedDeadlines = await Deadline.deleteMany({
      status: 'completed',
      completedAt: { $lt: oneYearAgo }
    });
    
    const deletedPendings = await Pending.deleteMany({
      status: 'completed',
      completedAt: { $lt: oneYearAgo }
    });
    
    // Clean up old communications (older than 2 years)
    const twoYearsAgo = moment().subtract(2, 'years').toDate();
    const deletedComms = await Communication.deleteMany({
      createdAt: { $lt: twoYearsAgo }
    });
    
    // Clean up orphaned documents
    const orphanedDocs = await Document.find({
      $or: [
        { client: { $exists: false } },
        { user: { $exists: false } }
      ]
    });
    
    for (const doc of orphanedDocs) {
      // Delete file from filesystem
      // TODO: Implement file deletion
      await doc.remove();
    }
    
    logJob(jobName, `Cleanup completed: ${deletedDeadlines.deletedCount} deadlines, ${deletedPendings.deletedCount} pendings, ${deletedComms.deletedCount} communications, ${orphanedDocs.length} orphaned documents`);
    
    jobStatus[jobName].lastRun = new Date();
    logJob(jobName, 'System cleanup job completed');
  } catch (error) {
    logJob(jobName, `Job failed: ${error.message}`, true);
  } finally {
    jobStatus[jobName].running = false;
  }
}, {
  scheduled: true,
  timezone: "Europe/Athens"
});

// Start all jobs
const startJobs = () => {
  deadlineRemindersJob.start();
  courtRemindersJob.start();
  appointmentRemindersJob.start();
  birthdayWishesJob.start();
  autoBackupJob.start();
  pendingRemindersJob.start();
  systemCleanupJob.start();
  
  console.log('All cron jobs started successfully');
};

// Stop all jobs
const stopJobs = () => {
  deadlineRemindersJob.stop();
  courtRemindersJob.stop();
  appointmentRemindersJob.stop();
  birthdayWishesJob.stop();
  autoBackupJob.stop();
  pendingRemindersJob.stop();
  systemCleanupJob.stop();
  
  console.log('All cron jobs stopped');
};

// Get job status
const getJobStatus = () => {
  return jobStatus;
};

module.exports = {
  startJobs,
  stopJobs,
  getJobStatus
};