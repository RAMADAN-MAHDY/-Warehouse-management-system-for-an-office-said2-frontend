export interface Item {
  _id: string;
  modelNumber: string;
  customer: string;
  name: string;
  quantity: number;
  price: number;
  customerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleInvoice {
  _id: string;
  modelNumber: string;
  sellerName: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  customerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  customerId: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  _id: string;
  description: string;
  amount: number;
  type: 'purchase' | 'adjustment';
  customerId: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfitSummary {
  totalCOGS: number;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  totalPurchases: number;
  purchases: Purchase[];
  expenses: Expense[];
}

export interface User {
  id: string;
  username: string;
  customerId: string;
  companyName: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
}

export interface InvoiceFile {
  _id: string;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
