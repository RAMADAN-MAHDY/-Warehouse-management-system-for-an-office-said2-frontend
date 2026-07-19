
import {
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  TrendingUp,
  Wallet,
  FileSpreadsheet,
  CreditCard,
  Home,
  ShieldCheck,
  Users,
  ListRestart,
  FileText,
  Building2,
  User,
  ShoppingBag
} from 'lucide-react';

export const navItems = [
  { name: 'الرئيسية', href: '/', icon: Home },
  { name: 'لوحة التحكم', href: '/dashboard', icon: BarChart2 },
  { name: 'المخزون', href: '/store', icon: LayoutDashboard },
  { name: 'المبيعات', href: '/sales', icon: ShoppingCart },
  { name: 'المناديب', href: '/representatives', icon: Users },
  { name: 'العملاء', href: '/clients', icon: User },
  { name: 'المرتجعات', href: '/returns', icon: ListRestart },
  { name: 'الموردين', href: '/suppliers', icon: Building2 },
  { name: 'المشتريات', href: '/purchases', icon: ShoppingBag },
  { name: 'فواتير المشتريات', href: '/purchase-invoices', icon: FileText },
  { name: 'الأرباح والتقارير', href: '/profit', icon: TrendingUp },
  { name: 'المصروفات', href: '/expenses', icon: Wallet },
  { name: 'الاشتراك', href: '/subscription', icon: CreditCard },
];

export const adminItems = [
  { name: 'إدارة النظام', href: '/admin/dashboard', icon: ShieldCheck },
  { name: 'المستخدمين', href: '/admin/users', icon: Users },
  { name: 'الاشتراكات', href: '/admin/plans', icon: CreditCard },
  { name: 'سجلات النظام', href: '/admin/audit', icon: ListRestart },
];

export default { navItems, adminItems };
