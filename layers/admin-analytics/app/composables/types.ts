export interface UserMetrics {
  totalUsers: number;
  totalLearners: number;
  totalMentors: number;
  activeUsers: number;
  newRegistrations: number;
}

export interface ContentMetrics {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  freeProjects: number;
  premiumProjects: number;
}

export interface TrafficMetrics {
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  yearlyVisitors: number;
  totalPageViews: number;
}

export interface FinancialMetrics {
  grossRevenue: number;
  netRevenue: number;
  subscriptionRevenue: number;
  classSalesRevenue: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
}
