import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اتصل بنا | نظام الإدارة المتطور',
  description: 'نحن هنا لمساعدتك! تواصل مع فريق دعم نظام إدارة المخازن لأي استفسارات أو دعم تقني.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
