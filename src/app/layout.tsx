import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/providers/StoreProvider";
import MainLayout from "@/components/layout/MainLayout";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: 'swap',
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "نظام إدارة المخازن | Warehouse Management System",
  description: "نظام متطور لإدارة المخازن والمبيعات والمشتريات والمصروفات بدقة وكفاءة عالية.",
  keywords: ["مخازن", "إدارة", "مبيعات", "مشتريات", "فواتير", "نظام محاسبي"],
  authors: [{ name: "Said" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`}>
      <body className="font-cairo bg-gray-900 text-gray-100 min-h-screen">
        <StoreProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
