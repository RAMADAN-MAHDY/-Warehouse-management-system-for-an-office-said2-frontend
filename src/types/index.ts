export interface Item {
  _id: string;
  modelNumber: string;
  customer: string;
  category?: string;
  name: string;
  quantity: number;
  minQuantity?: number;
  price: number;
  costPrice: number;
  customerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleInvoice {
  _id: string;
  modelNumber: string;
  sellerName?: string;
  representativeId?: string | null;
  name: string;
  quantity: number;
  price: number;
  costPrice: number;
  total: number;
  paidAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  customerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  paidAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
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
  itemId?: string | Item;
  modelNumber?: string;
  name?: string;
  quantity?: number;
  price?: number;
  supplier?: string;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
  customerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseInvoiceItem {
  itemId: string | Item;
  qty: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseInvoice {
  _id: string;
  invoiceNumber: string;
  supplierId: string | Supplier;
  date: string;
  status: 'posted' | 'cancelled';
  items: PurchaseInvoiceItem[];
  subTotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  customerId: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryAdjustment {
  _id: string;
  itemId: string | Item;
  qtyDelta: number;
  unitCost?: number;
  reason?: string;
  date: string;
  customerId: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfitSummary {
  totalCOGS: number;
  totalSales: number;
  grossSales?: number;
  totalReturns?: number;
  grossCOGS?: number;
  returnsCOGS?: number;
  totalExpenses: number;
  netProfit: number;
  totalPurchases: number;
  purchases?: Purchase[];
  expenses?: Expense[];
}

export interface Return {
  _id: string;
  saleInvoiceId: string;
  itemId: string | Item;
  modelNumber: string;
  name: string;
  quantity: number;
  price: number;
  costPrice: number;
  total: number;
  reason?: string;
  sellerName?: string;
  date: string;
  customerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Representative {
  _id: string;
  customerId: string;
  name: string;
  phone?: string;
  address?: string;
  commissionRate?: number;
  isActive: boolean;
  hiredAt?: string;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface RepresentativeListResponse extends ApiResponse<Representative[]> {
  pagination: Pagination;
}

export interface User {
  _id: string;
  username: string;
  customerId: string;
  companyName: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  isBanned: boolean;
  createdAt?: string;
  updatedAt?: string;
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
