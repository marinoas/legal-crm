// src/services/analyticsService.ts
import { apiClient } from './api';

// Types
interface AnalyticsPeriod {
  from: string;
  to: string;
  compareWith?: {
    from: string;
    to: string;
  };
}

interface DashboardMetrics {
  overview: {
    totalClients: number;
    activeClients: number;
    newClientsThisMonth: number;
    clientGrowthRate: number;
    
    totalCases: number;
    activeCases: number;
    casesWonRate: number;
    averageCaseDuration: number; // days
    
    upcomingAppointments: number;
    upcomingDeadlines: number;
    overdueDeadlines: number;
    
    monthlyRevenue: number;
    revenueGrowth: number;
    outstandingPayments: number;
    averagePaymentTime: number; // days
  };
  
  charts: {
    revenueChart: Array<{
      date: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
    
    casesChart: Array<{
      month: string;
      filed: number;
      won: number;
      lost: number;
      ongoing: number;
    }>;
    
    clientsChart: Array<{
      month: string;
      new: number;
      active: number;
      total: number;
    }>;
    
    workloadChart: Array<{
      user: string;
      cases: number;
      appointments: number;
      deadlines: number;
      completedTasks: number;
    }>;
  };
  
  recentActivity: Array<{
    id: string;
    type: 'client' | 'court' | 'deadline' | 'appointment' | 'payment';
    action: string;
    description: string;
    user: string;
    timestamp: string;
  }>;
  
  alerts: Array<{
    id: string;
    type: 'warning' | 'info' | 'error';
    message: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
  }>;
}

interface PerformanceMetrics {
  productivity: {
    casesPerUser: Record<string, number>;
    averageResponseTime: number; // hours
    taskCompletionRate: number;
    deadlineAdherence: number;
    appointmentUtilization: number;
  };
  
  financial: {
    revenuePerClient: number;
    revenuePerCase: number;
    collectionRate: number;
    averageInvoiceValue: number;
    paymentDelayIndex: number;
  };
  
  client: {
    satisfactionScore: number;
    retentionRate: number;
    referralRate: number;
    averageLifetimeValue: number;
  };
  
  efficiency: {
    caseResolutionTime: number;
    documentProcessingTime: number;
    averageWaitTime: number;
    automationRate: number;
  };
}

interface CaseAnalytics {
  byType: Record<string, {
    count: number;
    winRate: number;
    avgDuration: number;
    avgRevenue: number;
  }>;
  
  byCourt: Record<string, {
    count: number;
    winRate: number;
    judgeStats?: Record<string, { count: number; winRate: number }>;
  }>;
  
  byOutcome: {
    won: number;
    lost: number;
    settled: number;
    ongoing: number;
    withdrawn: number;
  };
  
  trends: Array<{
    month: string;
    totalCases: number;
    winRate: number;
    settlementRate: number;
  }>;
  
  predictions: {
    expectedWinRate: number;
    estimatedDuration: number;
    projectedRevenue: number;
    riskFactors: string[];
  };
}

interface ClientAnalytics {
  demographics: {
    byType: { individual: number; company: number };
    byLocation: Record<string, number>;
    byAgeGroup?: Record<string, number>;
    byIndustry?: Record<string, number>;
  };
  
  financial: {
    topClients: Array<{
      id: string;
      name: string;
      totalRevenue: number;
      cases: number;
      outstandingBalance: number;
    }>;
    
    revenueDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    
    paymentBehavior: {
      onTime: number;
      late: number;
      veryLate: number;
      defaulted: number;
    };
  };
  
  engagement: {
    activeRate: number;
    portalUsage: number;
    communicationFrequency: number;
    documentUploads: number;
  };
  
  acquisition: {
    sources: Record<string, number>;
    conversionRate: number;
    costPerAcquisition: number;
    lifetimeValue: number;
  };
}

interface FinancialAnalytics {
  revenue: {
    total: number;
    byService: Record<string, number>;
    byClient: Record<string, number>;
    recurring: number;
    oneTime: number;
    projectedMonthly: number;
    projectedAnnual: number;
  };
  
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    fixed: number;
    variable: number;
    projectedMonthly: number;
  };
  
  profitability: {
    grossProfit: number;
    netProfit: number;
    margin: number;
    ebitda: number;
    breakEvenPoint: number;
  };
  
  cashFlow: {
    current: number;
    projected30Days: number;
    projected90Days: number;
    burnRate: number;
    runway: number; // months
  };
  
  billing: {
    totalInvoiced: number;
    totalCollected: number;
    outstanding: number;
    overdue: number;
    writeOffs: number;
    collectionRate: number;
    dso: number; // Days Sales Outstanding
  };
}

interface TeamAnalytics {
  workload: Record<string, {
    activeCases: number;
    completedTasks: number;
    upcomingDeadlines: number;
    utilizationRate: number;
  }>;
  
  performance: Record<string, {
    casesWon: number;
    casesLost: number;
    tasksCompleted: number;
    deadlinesMet: number;
    clientSatisfaction: number;
    revenueGenerated: number;
  }>;
  
  activity: {
    loginFrequency: Record<string, number>;
    actionsPerDay: Record<string, number>;
    mostActiveHours: Record<number, number>;
    deviceUsage: { desktop: number; mobile: number; tablet: number };
  };
  
  collaboration: {
    sharedDocuments: number;
    internalCommunications: number;
    clientInteractions: number;
    teamMeetings: number;
  };
}

interface CustomReport {
  id: string;
  name: string;
  description?: string;
  type: 'table' | 'chart' | 'mixed';
  metrics: string[];
  filters: Record<string, any>;
  groupBy?: string[];
  sortBy?: string;
  visualization?: {
    type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap';
    xAxis?: string;
    yAxis?: string;
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel' | 'email';
  };
  createdBy: string;
  lastRun?: string;
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  includeCharts?: boolean;
  includeRawData?: boolean;
  dateFormat?: string;
  timezone?: string;
  language?: 'el' | 'en';
}

class AnalyticsService {
  private readonly basePath = '/analytics';

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(period?: AnalyticsPeriod): Promise<DashboardMetrics> {
    const { data } = await apiClient.get<DashboardMetrics>(
      `${this.basePath}/dashboard`,
      { params: period }
    );
    return data;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(period: AnalyticsPeriod): Promise<PerformanceMetrics> {
    const { data } = await apiClient.get<PerformanceMetrics>(
      `${this.basePath}/performance`,
      { params: period }
    );
    return data;
  }

  /**
   * Get case analytics
   */
  async getCaseAnalytics(
    period: AnalyticsPeriod,
    filters?: {
      clientId?: string;
      caseType?: string;
      court?: string;
    }
  ): Promise<CaseAnalytics> {
    const { data } = await apiClient.get<CaseAnalytics>(
      `${this.basePath}/cases`,
      { params: { ...period, ...filters } }
    );
    return data;
  }

  /**
   * Get client analytics
   */
  async getClientAnalytics(
    period: AnalyticsPeriod,
    filters?: {
      clientType?: 'individual' | 'company';
      location?: string;
      status?: string;
    }
  ): Promise<ClientAnalytics> {
    const { data } = await apiClient.get<ClientAnalytics>(
      `${this.basePath}/clients`,
      { params: { ...period, ...filters } }
    );
    return data;
  }

  /**
   * Get financial analytics
   */
  async getFinancialAnalytics(
    period: AnalyticsPeriod,
    filters?: {
      clientId?: string;
      category?: string;
    }
  ): Promise<FinancialAnalytics> {
    const { data } = await apiClient.get<FinancialAnalytics>(
      `${this.basePath}/financial`,
      { params: { ...period, ...filters } }
    );
    return data;
  }

  /**
   * Get team analytics
   */
  async getTeamAnalytics(
    period: AnalyticsPeriod,
    userId?: string
  ): Promise<TeamAnalytics> {
    const { data } = await apiClient.get<TeamAnalytics>(
      `${this.basePath}/team`,
      { params: { ...period, userId } }
    );
    return data;
  }

  /**
   * Get custom reports
   */
  async getCustomReports(): Promise<CustomReport[]> {
    const { data } = await apiClient.get<CustomReport[]>(
      `${this.basePath}/reports`
    );
    return data;
  }

  /**
   * Create custom report
   */
  async createCustomReport(
    report: Omit<CustomReport, 'id' | 'createdBy' | 'lastRun'>
  ): Promise<CustomReport> {
    const { data } = await apiClient.post<CustomReport>(
      `${this.basePath}/reports`,
      report
    );
    return data;
  }

  /**
   * Update custom report
   */
  async updateCustomReport(
    id: string,
    report: Partial<CustomReport>
  ): Promise<CustomReport> {
    const { data } = await apiClient.put<CustomReport>(
      `${this.basePath}/reports/${id}`,
      report
    );
    return data;
  }

  /**
   * Run custom report
   */
  async runCustomReport(
    id: string,
    period: AnalyticsPeriod
  ): Promise<{
    data: any;
    metadata: {
      executionTime: number;
      rowCount: number;
      period: AnalyticsPeriod;
    };
  }> {
    const { data } = await apiClient.post(
      `${this.basePath}/reports/${id}/run`,
      period
    );
    return data;
  }

  /**
   * Delete custom report
   */
  async deleteCustomReport(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/reports/${id}`);
  }

  /**
   * Export analytics data
   */
  async exportData(
    type: 'dashboard' | 'performance' | 'cases' | 'clients' | 'financial' | 'team',
    period: AnalyticsPeriod,
    options: ExportOptions
  ): Promise<Blob> {
    const { data } = await apiClient.post(
      `${this.basePath}/export/${type}`,
      { period, options },
      { responseType: 'blob' }
    );
    return data;
  }

  /**
   * Get predictive analytics
   */
  async getPredictiveAnalytics(
    model: 'revenue' | 'cases' | 'workload',
    horizon: number = 3 // months
  ): Promise<{
    predictions: Array<{
      date: string;
      value: number;
      confidence: number;
      upperBound: number;
      lowerBound: number;
    }>;
    accuracy: number;
    factors: Array<{
      name: string;
      impact: number;
    }>;
  }> {
    const { data } = await apiClient.get(
      `${this.basePath}/predictions/${model}`,
      { params: { horizon } }
    );
    return data;
  }

  /**
   * Get comparative analysis
   */
  async getComparativeAnalysis(
    metric: string,
    periods: AnalyticsPeriod[]
  ): Promise<{
    comparison: Array<{
      period: string;
      value: number;
      change: number;
      changePercentage: number;
    }>;
    trend: 'increasing' | 'decreasing' | 'stable';
    insights: string[];
  }> {
    const { data } = await apiClient.post(
      `${this.basePath}/compare`,
      { metric, periods }
    );
    return data;
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<{
    onlineUsers: number;
    activeClients: number;
    todaysAppointments: number;
    todaysRevenue: number;
    pendingActions: number;
    systemHealth: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      errorRate: number;
    };
  }> {
    const { data } = await apiClient.get(`${this.basePath}/realtime`);
    return data;
  }

  /**
   * Subscribe to metric alerts
   */
  async subscribeToAlerts(
    alerts: Array<{
      metric: string;
      condition: 'above' | 'below' | 'equals' | 'changes';
      threshold: number;
      frequency: 'immediate' | 'hourly' | 'daily';
    }>
  ): Promise<{ subscriptionId: string }> {
    const { data } = await apiClient.post(`${this.basePath}/alerts/subscribe`, {
      alerts,
    });
    return data;
  }

  /**
   * Get metric history
   */
  async getMetricHistory(
    metric: string,
    granularity: 'hour' | 'day' | 'week' | 'month',
    period: AnalyticsPeriod
  ): Promise<Array<{
    timestamp: string;
    value: number;
    metadata?: any;
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/metrics/${metric}/history`, {
      params: { granularity, ...period },
    });
    return data;
  }

  /**
   * Get insights and recommendations
   */
  async getInsights(): Promise<Array<{
    id: string;
    category: 'revenue' | 'efficiency' | 'risk' | 'opportunity';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    recommendation: string;
    potentialImpact?: {
      metric: string;
      value: number;
      unit: string;
    };
    createdAt: string;
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/insights`);
    return data;
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

// Export singleton
export default analyticsService;

// Export types
export type {
  AnalyticsPeriod,
  DashboardMetrics,
  PerformanceMetrics,
  CaseAnalytics,
  ClientAnalytics,
  FinancialAnalytics,
  TeamAnalytics,
  CustomReport,
  ExportOptions,
};
