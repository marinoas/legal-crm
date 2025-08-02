const mongoose = require('mongoose');
const { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths, subYears } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

// Models
const User = require('../models/User');
const Client = require('../models/Client');
const Court = require('../models/Court');
const Deadline = require('../models/Deadline');
const Appointment = require('../models/Appointment');
const Financial = require('../models/Financial');
const Document = require('../models/Document');
const Communication = require('../models/Communication');

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Cache management
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Dashboard Analytics
  async getDashboardStats(userId, dateRange = {}) {
    const cacheKey = `dashboard:${userId}:${JSON.stringify(dateRange)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const { startDate = startOfMonth(new Date()).toDate(), endDate = new Date() } = dateRange;

    const [
      clientStats,
      courtStats,
      financialStats,
      productivityStats,
      upcomingEvents
    ] = await Promise.all([
      this.getClientStats(userId, startDate, endDate),
      this.getCourtStats(userId, startDate, endDate),
      this.getFinancialStats(userId, startDate, endDate),
      this.getProductivityStats(userId, startDate, endDate),
      this.getUpcomingEvents(userId)
    ]);

    const result = {
      clients: clientStats,
      courts: courtStats,
      financial: financialStats,
      productivity: productivityStats,
      upcoming: upcomingEvents,
      generated: new Date()
    };

    this.setCache(cacheKey, result);
    return result;
  }

  // Client Analytics
  async getClientStats(userId, startDate, endDate) {
    const pipeline = [
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          new: [
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $count: 'count' }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          topByRevenue: [
            {
              $lookup: {
                from: 'financials',
                localField: '_id',
                foreignField: 'client',
                as: 'transactions'
              }
            },
            {
              $project: {
                name: { $concat: ['$firstName', ' ', '$lastName'] },
                companyName: 1,
                revenue: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$transactions',
                          as: 'trans',
                          cond: { $eq: ['$$trans.type', 'income'] }
                        }
                      },
                      as: 'income',
                      in: '$$income.amount'
                    }
                  }
                }
              }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
          ],
          retention: [
            {
              $project: {
                monthsSinceFirst: {
                  $dateDiff: {
                    startDate: '$createdAt',
                    endDate: new Date(),
                    unit: 'month'
                  }
                }
              }
            },
            {
              $bucket: {
                groupBy: '$monthsSinceFirst',
                boundaries: [0, 3, 6, 12, 24, 36],
                default: 'Other',
                output: { count: { $sum: 1 } }
              }
            }
          ]
        }
      }
    ];

    const [result] = await Client.aggregate(pipeline);

    return {
      total: result.total[0]?.count || 0,
      new: result.new[0]?.count || 0,
      byType: result.byType,
      topByRevenue: result.topByRevenue,
      retention: result.retention,
      growthRate: this.calculateGrowthRate(result.total[0]?.count || 0, result.new[0]?.count || 0)
    };
  }

  // Court Analytics
  async getCourtStats(userId, startDate, endDate) {
    const pipeline = [
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          byMonth: [
            {
              $match: {
                date: { $gte: subMonths(new Date(), 12).toDate() }
              }
            },
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' }
                },
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                postponed: {
                  $sum: { $cond: [{ $eq: ['$status', 'postponed'] }, 1, 0] }
                }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ],
          successRate: [
            {
              $match: {
                status: { $in: ['completed', 'postponed'] },
                date: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                favorable: {
                  $sum: {
                    $cond: [{ $eq: ['$outcome', 'favorable'] }, 1, 0]
                  }
                },
                partial: {
                  $sum: {
                    $cond: [{ $eq: ['$outcome', 'partial'] }, 1, 0]
                  }
                },
                unfavorable: {
                  $sum: {
                    $cond: [{ $eq: ['$outcome', 'unfavorable'] }, 1, 0]
                  }
                }
              }
            }
          ],
          averageDuration: [
            {
              $match: {
                status: 'completed',
                completedDate: { $exists: true }
              }
            },
            {
              $project: {
                duration: {
                  $dateDiff: {
                    startDate: '$createdAt',
                    endDate: '$completedDate',
                    unit: 'day'
                  }
                },
                type: 1
              }
            },
            {
              $group: {
                _id: '$type',
                avgDuration: { $avg: '$duration' },
                minDuration: { $min: '$duration' },
                maxDuration: { $max: '$duration' }
              }
            }
          ]
        }
      }
    ];

    const [result] = await Court.aggregate(pipeline);

    const successData = result.successRate[0] || { total: 0, favorable: 0, partial: 0, unfavorable: 0 };
    const successRate = successData.total > 0 
      ? ((successData.favorable + successData.partial * 0.5) / successData.total * 100).toFixed(1)
      : 0;

    return {
      total: result.total[0]?.count || 0,
      byStatus: result.byStatus,
      byType: result.byType,
      monthlyTrend: result.byMonth,
      successRate: parseFloat(successRate),
      outcomes: {
        favorable: successData.favorable,
        partial: successData.partial,
        unfavorable: successData.unfavorable
      },
      averageDuration: result.averageDuration
    };
  }

  // Financial Analytics
  async getFinancialStats(userId, startDate, endDate) {
    const pipeline = [
      { 
        $match: { 
          user: mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
                avgAmount: { $avg: '$amount' }
              }
            }
          ],
          byCategory: [
            {
              $group: {
                _id: { type: '$type', category: '$category' },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: '$_id.type',
                categories: {
                  $push: {
                    category: '$_id.category',
                    total: '$total',
                    count: '$count'
                  }
                }
              }
            }
          ],
          monthlyFlow: [
            {
              $group: {
                _id: {
                  year: { $year: '$date' },
                  month: { $month: '$date' }
                },
                income: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                },
                expenses: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ],
          paymentMethods: [
            {
              $match: { type: 'income' }
            },
            {
              $group: {
                _id: '$paymentMethod',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ],
          outstandingInvoices: [
            {
              $match: {
                type: 'income',
                status: 'pending'
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 },
                oldest: { $min: '$date' }
              }
            }
          ],
          clientProfitability: [
            {
              $lookup: {
                from: 'clients',
                localField: 'client',
                foreignField: '_id',
                as: 'clientInfo'
              }
            },
            { $unwind: '$clientInfo' },
            {
              $group: {
                _id: '$client',
                clientName: { 
                  $first: { 
                    $concat: ['$clientInfo.firstName', ' ', '$clientInfo.lastName'] 
                  } 
                },
                income: {
                  $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] }
                },
                expenses: {
                  $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] }
                }
              }
            },
            {
              $project: {
                clientName: 1,
                income: 1,
                expenses: 1,
                profit: { $subtract: ['$income', '$expenses'] },
                margin: {
                  $cond: [
                    { $eq: ['$income', 0] },
                    0,
                    { $multiply: [{ $divide: [{ $subtract: ['$income', '$expenses'] }, '$income'] }, 100] }
                  ]
                }
              }
            },
            { $sort: { profit: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ];

    const [result] = await Financial.aggregate(pipeline);

    const income = result.summary.find(s => s._id === 'income') || { total: 0, count: 0 };
    const expenses = result.summary.find(s => s._id === 'expense') || { total: 0, count: 0 };
    const profit = income.total - expenses.total;
    const margin = income.total > 0 ? (profit / income.total * 100).toFixed(1) : 0;

    return {
      income: income.total,
      expenses: expenses.total,
      profit,
      margin: parseFloat(margin),
      transactions: income.count + expenses.count,
      averageTransaction: income.count > 0 ? income.avgAmount : 0,
      byCategory: result.byCategory,
      monthlyFlow: result.monthlyFlow,
      paymentMethods: result.paymentMethods,
      outstanding: result.outstandingInvoices[0] || { total: 0, count: 0 },
      topClients: result.clientProfitability
    };
  }

  // Productivity Analytics
  async getProductivityStats(userId, startDate, endDate) {
    const [
      appointments,
      deadlines,
      documents,
      communications
    ] = await Promise.all([
      this.getAppointmentStats(userId, startDate, endDate),
      this.getDeadlineStats(userId, startDate, endDate),
      this.getDocumentStats(userId, startDate, endDate),
      this.getCommunicationStats(userId, startDate, endDate)
    ]);

    // Calculate productivity score
    const productivityScore = this.calculateProductivityScore({
      appointments,
      deadlines,
      documents,
      communications
    });

    return {
      appointments,
      deadlines,
      documents,
      communications,
      score: productivityScore,
      trends: await this.getProductivityTrends(userId)
    };
  }

  async getAppointmentStats(userId, startDate, endDate) {
    const stats = await Appointment.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          utilizationRate: [
            {
              $group: {
                _id: null,
                totalMinutes: { $sum: '$duration' },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const utilization = result.utilizationRate[0] || { totalMinutes: 0, count: 0 };
    
    // Assuming 8 working hours per day
    const workingDays = differenceInDays(new Date(endDate), new Date(startDate));
    const availableMinutes = workingDays * 8 * 60;
    const utilizationRate = availableMinutes > 0 
      ? (utilization.totalMinutes / availableMinutes * 100).toFixed(1)
      : 0;

    return {
      total: result.total[0]?.count || 0,
      completed: result.byStatus.find(s => s._id === 'completed')?.count || 0,
      noShow: result.byStatus.find(s => s._id === 'no-show')?.count || 0,
      utilizationRate: parseFloat(utilizationRate),
      averageDuration: utilization.count > 0 
        ? Math.round(utilization.totalMinutes / utilization.count)
        : 0
    };
  }

  async getDeadlineStats(userId, startDate, endDate) {
    const stats = await Deadline.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          completionRate: [
            {
              $match: {
                status: { $in: ['completed', 'overdue'] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                onTime: {
                  $sum: {
                    $cond: [
                      { $lte: ['$completedAt', '$dueDate'] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const completion = result.completionRate[0] || { total: 0, onTime: 0 };
    const completionRate = completion.total > 0 
      ? (completion.onTime / completion.total * 100).toFixed(1)
      : 100;

    return {
      total: result.total[0]?.count || 0,
      completed: result.byStatus.find(s => s._id === 'completed')?.count || 0,
      overdue: result.byStatus.find(s => s._id === 'overdue')?.count || 0,
      pending: result.byStatus.find(s => s._id === 'pending')?.count || 0,
      completionRate: parseFloat(completionRate),
      byPriority: result.byPriority
    };
  }

  async getDocumentStats(userId, startDate, endDate) {
    const stats = await Document.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          uploadDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          totalSize: [
            { $group: { _id: null, size: { $sum: '$size' } } }
          ],
          averageProcessingTime: [
            {
              $match: { processedAt: { $exists: true } }
            },
            {
              $project: {
                processingTime: {
                  $dateDiff: {
                    startDate: '$uploadDate',
                    endDate: '$processedAt',
                    unit: 'hour'
                  }
                }
              }
            },
            {
              $group: {
                _id: null,
                avgTime: { $avg: '$processingTime' }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];

    return {
      total: result.total[0]?.count || 0,
      byCategory: result.byCategory,
      totalSizeMB: Math.round((result.totalSize[0]?.size || 0) / 1024 / 1024),
      avgProcessingHours: Math.round(result.averageProcessingTime[0]?.avgTime || 0)
    };
  }

  async getCommunicationStats(userId, startDate, endDate) {
    const stats = await Communication.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          byDirection: [
            { $group: { _id: '$direction', count: { $sum: 1 } } }
          ],
          responseTime: [
            {
              $match: {
                direction: 'incoming',
                responseDate: { $exists: true }
              }
            },
            {
              $project: {
                responseTime: {
                  $dateDiff: {
                    startDate: '$date',
                    endDate: '$responseDate',
                    unit: 'hour'
                  }
                }
              }
            },
            {
              $group: {
                _id: null,
                avgResponseTime: { $avg: '$responseTime' }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];

    return {
      total: result.total[0]?.count || 0,
      byType: result.byType,
      incoming: result.byDirection.find(d => d._id === 'incoming')?.count || 0,
      outgoing: result.byDirection.find(d => d._id === 'outgoing')?.count || 0,
      avgResponseHours: Math.round(result.responseTime[0]?.avgResponseTime || 0)
    };
  }

  // Upcoming Events
  async getUpcomingEvents(userId, days = 7) {
    const endDate = addDays(new Date(), days);

    const [courts, deadlines, appointments] = await Promise.all([
      Court.find({
        user: userId,
        date: { $gte: new Date(), $lte: endDate },
        status: 'scheduled'
      })
        .populate('client', 'firstName lastName')
        .sort('date')
        .limit(10),

      Deadline.find({
        user: userId,
        dueDate: { $gte: new Date(), $lte: endDate },
        status: 'pending'
      })
        .populate('client', 'firstName lastName')
        .sort('dueDate')
        .limit(10),

      Appointment.find({
        user: userId,
        date: { $gte: new Date(), $lte: endDate },
        status: 'scheduled'
      })
        .populate('client', 'firstName lastName')
        .sort('date')
        .limit(10)
    ]);

    // Combine and sort all events
    const events = [
      ...courts.map(c => ({
        type: 'court',
        title: `Δικαστήριο: ${c.type}`,
        client: c.client,
        date: c.date,
        priority: 'high',
        details: {
          court: c.court,
          opponent: c.opponent
        }
      })),
      ...deadlines.map(d => ({
        type: 'deadline',
        title: d.name,
        client: d.client,
        date: d.dueDate,
        priority: d.priority,
        details: {
          category: d.category
        }
      })),
      ...appointments.map(a => ({
        type: 'appointment',
        title: `Ραντεβού: ${a.purpose}`,
        client: a.client,
        date: a.date,
        priority: 'medium',
        details: {
          duration: a.duration,
          type: a.type
        }
      }))
    ].sort((a, b) => a.date - b.date);

    return events.slice(0, 15);
  }

  // Trend Analysis
  async getProductivityTrends(userId) {
    const sixMonthsAgo = subMonths(new Date(), 6).startOf('month').toDate();
    
    const trends = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const start = startOfMonth(subMonths(new Date(), 5 - i));
        const end = endOfMonth(subMonths(new Date(), 5 - i));
        
        return this.getMonthlyProductivity(userId, start, end);
      })
    );

    return trends;
  }

  async getMonthlyProductivity(userId, startDate, endDate) {
    const [
      appointments,
      deadlines,
      revenue,
      hours
    ] = await Promise.all([
      Appointment.countDocuments({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }),
      Deadline.countDocuments({
        user: userId,
        completedAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }),
      Financial.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
            type: 'income'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      Appointment.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalMinutes: { $sum: '$duration' }
          }
        }
      ])
    ]);

    return {
      month: format(new Date(startDate), 'yyyy-MM'),
      appointments,
      deadlines,
      revenue: revenue[0]?.total || 0,
      hours: Math.round((hours[0]?.totalMinutes || 0) / 60)
    };
  }

  // Helper Methods
  calculateGrowthRate(total, newCount) {
    const previous = total - newCount;
    if (previous === 0) return 100;
    return ((newCount / previous) * 100).toFixed(1);
  }

  calculateProductivityScore(data) {
    const weights = {
      appointmentCompletion: 0.25,
      deadlineCompletion: 0.25,
      responseTime: 0.20,
      utilization: 0.30
    };

    const scores = {
      appointmentCompletion: data.appointments.completed / (data.appointments.total || 1) * 100,
      deadlineCompletion: data.deadlines.completionRate,
      responseTime: Math.max(0, 100 - data.communications.avgResponseHours * 2),
      utilization: data.appointments.utilizationRate
    };

    const weightedScore = Object.keys(weights).reduce((total, key) => {
      return total + (scores[key] * weights[key]);
    }, 0);

    return Math.round(weightedScore);
  }

  // Report Generation
  async generateReport(userId, reportType, options = {}) {
    const reports = {
      monthly: () => this.generateMonthlyReport(userId, options),
      quarterly: () => this.generateQuarterlyReport(userId, options),
      annual: () => this.generateAnnualReport(userId, options),
      client: () => this.generateClientReport(userId, options.clientId),
      financial: () => this.generateFinancialReport(userId, options),
      performance: () => this.generatePerformanceReport(userId, options)
    };

    const generator = reports[reportType];
    if (!generator) {
      throw new Error(`Unknown report type: ${reportType}`);
    }

    return await generator();
  }

  async generateMonthlyReport(userId, options) {
    const { year, month } = options;
    const startDate = startOfMonth(new Date(year, month - 1, 1));
    const endDate = endOfMonth(new Date(year, month - 1, 1));

    const [
      dashboard,
      courtDetails,
      financialDetails,
      clientActivity
    ] = await Promise.all([
      this.getDashboardStats(userId, { startDate, endDate }),
      this.getDetailedCourtAnalysis(userId, startDate, endDate),
      this.getDetailedFinancialAnalysis(userId, startDate, endDate),
      this.getClientActivityReport(userId, startDate, endDate)
    ]);

    return {
      type: 'monthly',
      period: { year, month },
      generatedAt: new Date(),
      summary: this.generateExecutiveSummary(dashboard),
      sections: {
        overview: dashboard,
        courts: courtDetails,
        financial: financialDetails,
        clients: clientActivity
      },
      recommendations: await this.generateRecommendations(dashboard)
    };
  }

  async generateExecutiveSummary(data) {
    const summary = {
      highlights: [],
      concerns: [],
      metrics: {}
    };

    // Revenue highlights
    if (data.financial.margin > 70) {
      summary.highlights.push('Εξαιρετικό περιθώριο κέρδους');
    }
    if (data.financial.income > data.financial.expenses * 2) {
      summary.highlights.push('Υγιής οικονομική απόδοση');
    }

    // Productivity highlights
    if (data.productivity.score > 80) {
      summary.highlights.push('Υψηλή παραγωγικότητα');
    }

    // Concerns
    if (data.financial.outstanding.count > 10) {
      summary.concerns.push(`${data.financial.outstanding.count} ανεξόφλητα τιμολόγια`);
    }
    if (data.courts.successRate < 50) {
      summary.concerns.push('Χαμηλό ποσοστό επιτυχίας υποθέσεων');
    }

    // Key metrics
    summary.metrics = {
      totalRevenue: data.financial.income,
      totalExpenses: data.financial.expenses,
      netProfit: data.financial.profit,
      activeClients: data.clients.total,
      completedCases: data.courts.total,
      productivityScore: data.productivity.score
    };

    return summary;
  }

  async generateRecommendations(data) {
    const recommendations = [];

    // Financial recommendations
    if (data.financial.outstanding.total > data.financial.income * 0.3) {
      recommendations.push({
        category: 'financial',
        priority: 'high',
        title: 'Βελτίωση είσπραξης οφειλών',
        description: 'Το ποσό των ανεξόφλητων τιμολογίων είναι υψηλό. Προτείνεται άμεση επικοινωνία με τους οφειλέτες.',
        action: 'Αποστολή υπενθυμίσεων πληρωμής'
      });
    }

    // Productivity recommendations
    if (data.productivity.appointments.utilizationRate < 60) {
      recommendations.push({
        category: 'productivity',
        priority: 'medium',
        title: 'Αύξηση χρήσης διαθέσιμου χρόνου',
        description: 'Ο βαθμός αξιοποίησης του χρόνου είναι χαμηλός. Εξετάστε την αύξηση των ραντεβού.',
        action: 'Προώθηση online booking'
      });
    }

    // Client recommendations
    if (data.clients.new < data.clients.total * 0.05) {
      recommendations.push({
        category: 'growth',
        priority: 'medium',
        title: 'Προσέλκυση νέων πελατών',
        description: 'Ο ρυθμός απόκτησης νέων πελατών είναι χαμηλός.',
        action: 'Ενίσχυση marketing ενεργειών'
      });
    }

    return recommendations;
  }

  // Export functionality
  async exportAnalytics(userId, format, options) {
    const data = await this.getDashboardStats(userId, options.dateRange);
    
    switch (format) {
      case 'pdf':
        return this.exportToPDF(data, options);
      case 'excel':
        return this.exportToExcel(data, options);
      case 'csv':
        return this.exportToCSV(data, options);
      default:
        return data;
    }
  }

  async exportToPDF(data, options) {
    // Would integrate with PDF generation library
    console.log('PDF export not yet implemented');
    return null;
  }

  async exportToExcel(data, options) {
    // Would integrate with Excel generation library
    console.log('Excel export not yet implemented');
    return null;
  }

  async exportToCSV(data, options) {
    // Would integrate with CSV generation
    console.log('CSV export not yet implemented');
    return null;
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
module.exports = analyticsService;
