export interface RevenueOverview {
  totalSales: number;
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  lifetimeRevenue: number;
}

export interface SalesAnalytics {
  projectId: number;
  projectTitle: string;
  enrollmentCount: number;
  revenue: number;
}

export interface Transaction {
  id: number;
  projectId: number;
  projectTitle: string;
  learnerName: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'FAILED' | 'PENDING';
  purchaseDate: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
