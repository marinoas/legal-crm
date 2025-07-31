const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Settings = require('../models/Settings');
const { protect, authorize, checkPermission, clientPortalAuth } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const { sendSMS, smsTemplates } = require('../utils/sendSMS');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
router.get('/', protect, checkPermission('appointments', 'view'), async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.startTime = {};
      if (req.query.startDate) {
        query.startTime.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.startTime.$lte = endDate;
      }
    }
    
    // Filter by client
    if (req.query.client) {
      query.client = req.query.client;
    }
    
    // Filter by payment status
    if (req.query.paymentStatus) {
      query['payment.status'] = req.query.paymentStatus;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Appointment.countDocuments(query);

    // Execute query
    const appointments = await Appointment.find(query)
      .populate('client', 'firstName lastName folderNumber mobile email')
      .populate('createdBy', 'name')
      .populate('bookedBy', 'name')
      .populate('relatedCourt', 'caseTitle')
      .sort({ startTime: -1 })
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pagination,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get appointments for client portal
// @route   GET /api/appointments/my-appointments
// @access  Client Portal
router.get('/my-appointments', clientPortalAuth, async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ 
      client: req.client._id,
      startTime: { $gte: new Date() }
    })
      .select('-privateNotes -emailHistory')
      .populate('relatedCourt', 'caseTitle')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get available slots for booking
// @route   GET /api/appointments/available-slots
// @access  Public/Client Portal
router.get('/available-slots', async (req, res, next) => {
  try {
    const { date, type = 'in-person' } = req.query;

    if (!date) {
      return next(new ErrorResponse('Απαιτείται ημερομηνία', 400));
    }

    // Get appointment settings
    const settings = await Settings.getByCategory('appointments');
    const appointmentSettings = settings.appointments;

    // Parse date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Check if date is blocked
    const isBlocked = appointmentSettings.blockedDates.some(blocked => {
      const blockedDate = new Date(blocked.date);
      return blockedDate.toDateString() === selectedDate.toDateString();
    });

    if (isBlocked) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get slots for the day
    const daySlots = appointmentSettings.availableSlots.find(slot => 
      slot.dayOfWeek === dayOfWeek
    );

    if (!daySlots || !daySlots.slots.length) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Get existing appointments for the date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      status: { $in: ['scheduled', 'confirmed'] },
      startTime: { $gte: startOfDay, $lte: endOfDay }
    });

    // Check each slot availability
    const availableSlots = [];
    
    for (const slot of daySlots.slots) {
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);
      
      const slotStart = new Date(selectedDate);
      slotStart.setHours(startHour, startMinute, 0, 0);
      
      const slotEnd = new Date(selectedDate);
      slotEnd.setHours(endHour, endMinute, 0, 0);
      
      // Generate appointment slots within this time slot
      const duration = appointmentSettings.defaultDuration;
      const buffer = appointmentSettings.bufferTime;
      
      let currentTime = new Date(slotStart);
      
      while (currentTime < slotEnd) {
        const appointmentEnd = new Date(currentTime);
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);
        
        if (appointmentEnd > slotEnd) break;
        
        // Check if slot is available
        const isAvailable = await Appointment.checkAvailability(
          currentTime,
          appointmentEnd
        );
        
        if (isAvailable) {
          availableSlots.push({
            startTime: currentTime.toISOString(),
            endTime: appointmentEnd.toISOString(),
            type: type
          });
        }
        
        // Move to next slot
        currentTime.setMinutes(currentTime.getMinutes() + duration + buffer);
      }
    }

    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', protect, checkPermission('appointments', 'view'), async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'firstName lastName folderNumber email mobile')
      .populate('createdBy', 'name')
      .populate('bookedBy', 'name')
      .populate('relatedCourt', 'caseTitle')
      .populate('attendees');

    if (!appointment) {
      return next(new ErrorResponse(`Ραντεβού με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
router.post('/', protect, checkPermission('appointments', 'create'), async (req, res, next) => {
  try {
    // Add creator
    req.body.createdBy = req.user.id;
    req.body.bookedBy = req.user.id;

    // Check availability
    const isAvailable = await Appointment.checkAvailability(
      req.body.startTime,
      req.body.endTime
    );

    if (!isAvailable) {
      return next(new ErrorResponse('Το χρονικό διάστημα δεν είναι διαθέσιμο', 400));
    }

    const appointment = await Appointment.create(req.body);

    // Send confirmation email
    const client = await Client.findById(appointment.client);
    if (client && client.email) {
      try {
        const emailContent = emailTemplates.appointmentConfirmation(appointment, client);
        await sendEmail({
          to: client.email,
          ...emailContent
        });
        
        await appointment.sendEmailNotification('confirmation');
      } catch (emailError) {
        console.error('Appointment confirmation email error:', emailError);
      }
    }

    // Send SMS reminder if enabled
    if (client && client.mobile && client.preferences.receiveSMS) {
      try {
        const smsText = smsTemplates.appointmentReminder(appointment, client);
        await sendSMS({
          to: client.mobile,
          text: smsText
        });
      } catch (smsError) {
        console.error('Appointment SMS error:', smsError);
      }
    }

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Book appointment (Client Portal)
// @route   POST /api/appointments/book
// @access  Client Portal
router.post('/book', clientPortalAuth, async (req, res, next) => {
  try {
    const { startTime, endTime, type, description } = req.body;

    // Get appointment settings
    const settings = await Settings.getByCategory('appointments');
    
    // Check if payment is required
    if (settings.appointments.requirePayment && !req.body.paymentIntentId) {
      return next(new ErrorResponse('Απαιτείται πληρωμή για την κράτηση ραντεβού', 400));
    }

    // Check availability
    const isAvailable = await Appointment.checkAvailability(startTime, endTime);

    if (!isAvailable) {
      return next(new ErrorResponse('Το χρονικό διάστημα δεν είναι διαθέσιμο', 400));
    }

    // Create appointment
    const appointment = await Appointment.create({
      client: req.client._id,
      title: description || 'Ραντεβού συμβουλευτικής',
      description,
      startTime,
      endTime,
      type,
      payment: {
        required: settings.appointments.requirePayment,
        amount: settings.appointments.appointmentPrice,
        status: req.body.paymentIntentId ? 'paid' : 'pending',
        method: 'card',
        transactionId: req.body.paymentIntentId
      },
      bookedBy: req.user.id,
      createdBy: req.user.id,
      bookingIp: req.ip
    });

    // Send confirmation email
    try {
      const emailContent = emailTemplates.appointmentConfirmation(appointment, req.client);
      await sendEmail({
        to: req.client.email,
        ...emailContent
      });
      
      await appointment.sendEmailNotification('confirmation');
    } catch (emailError) {
      console.error('Appointment booking email error:', emailError);
    }

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
router.put('/:id', protect, checkPermission('appointments', 'edit'), async (req, res, next) => {
  try {
    req.body.lastModifiedBy = req.user.id;

    // If changing time, check availability
    if (req.body.startTime || req.body.endTime) {
      const appointment = await Appointment.findById(req.params.id);
      
      const isAvailable = await Appointment.checkAvailability(
        req.body.startTime || appointment.startTime,
        req.body.endTime || appointment.endTime,
        req.params.id
      );

      if (!isAvailable) {
        return next(new ErrorResponse('Το νέο χρονικό διάστημα δεν είναι διαθέσιμο', 400));
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('relatedCourt', 'caseTitle');

    if (!appointment) {
      return next(new ErrorResponse(`Ραντεβού με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
router.delete('/:id', protect, checkPermission('appointments', 'delete'), async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorResponse(`Ραντεβού με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await appointment.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Confirm appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private
router.put('/:id/confirm', protect, checkPermission('appointments', 'edit'), async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'firstName lastName email mobile');

    if (!appointment) {
      return next(new ErrorResponse(`Ραντεβού με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (appointment.status !== 'scheduled') {
      return next(new ErrorResponse('Το ραντεβού δεν είναι σε κατάσταση προγραμματισμού', 400));
    }

    await appointment.confirm(req.user.id);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private
router.put('/:id/complete', protect, checkPermission('appointments', 'edit'), async (req, res, next) => {
  try {
    const { notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorResponse(`Ραντεβού με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (appointment.isPast) {
      return next(new ErrorResponse('Το ραντεβού έχει ήδη παρέλθει', 400));
    }

    await appointment.complete(req.user.id, notes);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const { reason, refund } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!appointment) {
      return next(new ErrorResponse(`Ραντεβού με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Check permissions
    if (req.user.role === 'client' && appointment.client._id.toString() !== req.client._id.toString()) {
      return next(new ErrorResponse('Δεν έχετε δικαίωμα να ακυρώσετε αυτό το ραντεβού', 403));
    }

    await appointment.cancel(req.user.id, reason, refund);

    // Send cancellation email
    if (appointment.client.email) {
      try {
        await sendEmail({
          to: appointment.client.email,
          subject: `Ακύρωση ραντεβού - ${appointment.formattedDate}`,
          html: `
            <h3>Ακύρωση Ραντεβού</h3>
            <p>Αγαπητέ/ή ${appointment.client.fullName},</p>
            <p>Το ραντεβού σας για ${appointment.formattedDate} ${appointment.formattedTime} έχει ακυρωθεί.</p>
            ${reason ? `<p><strong>Λόγος:</strong> ${reason}</p>` : ''}
            ${refund ? '<p>Θα λάβετε επιστροφή χρημάτων εντός 5-7 εργάσιμων ημερών.</p>' : ''}
            <p>Για επαναπρογραμματισμό επικοινωνήστε μαζί μας.</p>
          `
        });
        
        await appointment.sendEmailNotification('cancellation');
      } catch (emailError) {
        console.error('Appointment cancellation email error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
router.put('/:id/reschedule', protect, async (req, res, next) => {
  try {
    const { newStartTime, newEndTime } = req.body;

    if (!newStartTime || !newEndTime) {
      return next(new ErrorResponse('Απαιτείται νέα ώρα έναρξης και λήξης', 400));
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!appointment) {
      return next(new ErrorResponse(`Ραντεβού με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Check permissions
    if (req.user.role === 'client' && appointment.client._id.toString() !== req.client._id.toString()) {
      return next(new ErrorResponse('Δεν έχετε δικαίωμα να αλλάξετε αυτό το ραντεβού', 403));
    }

    const newAppointment = await appointment.reschedule(
      new Date(newStartTime),
      new Date(newEndTime),
      req.user.id
    );

    // Send rescheduling email
    if (appointment.client.email) {
      try {
        await sendEmail({
          to: appointment.client.email,
          subject: 'Αλλαγή ραντεβού',
          html: `
            <h3>Αλλαγή Ραντεβού</h3>
            <p>Αγαπητέ/ή ${appointment.client.fullName},</p>
            <p>Το ραντεβού σας έχει μεταφερθεί.</p>
            <p><strong>Από:</strong> ${appointment.formattedDate} ${appointment.formattedTime}</p>
            <p><strong>Σε:</strong> ${newAppointment.formattedDate} ${newAppointment.formattedTime}</p>
          `
        });
        
        await appointment.sendEmailNotification('rescheduled');
      } catch (emailError) {
        console.error('Appointment rescheduling email error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: newAppointment
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get today's appointments
// @route   GET /api/appointments/today
// @access  Private
router.get('/today/list', protect, checkPermission('appointments', 'view'), async (req, res, next) => {
  try {
    const appointments = await Appointment.getDayAppointments(new Date());

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
router.get('/stats/overview', protect, checkPermission('appointments', 'view'), async (req, res, next) => {
  try {
    // Date range
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await Appointment.aggregate([
      {
        $match: {
          startTime: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          scheduled: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShow: {
            $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, '$payment.amount', 0] }
          },
          byType: {
            $push: '$type'
          }
        }
      }
    ]);

    // Count by type
    const byType = {};
    if (stats.length > 0) {
      stats[0].byType.forEach(type => {
        byType[type] = (byType[type] || 0) + 1;
      });
    }

    // Average appointment duration
    const avgDuration = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          scheduled: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
          totalRevenue: 0
        },
        byType,
        avgDuration: avgDuration[0]?.avgDuration || 0,
        dateRange: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;