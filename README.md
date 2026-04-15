# 📦 نظام إدارة المخازن والمبيعات الاحترافي (Next.js 16)

واجهة مستخدم عصرية ومتطورة لنظام إدارة المخازن، المبيعات، المشتريات، والمصروفات. تم بناء النظام باستخدام أحدث التقنيات لعام 2026 لضمان سرعة الأداء وسهولة الاستخدام مع دعم كامل للغة العربية (RTL).

---

## 🌟 المميزات الرئيسية (Core Features)

- **📊 لوحة تحكم ذكية (Smart Dashboard):** عرض ملخص للأداء، الإيرادات، المصروفات، والمنتجات الأكثر مبيعاً مع رسوم بيانية تفاعلية (Chart.js).
- **📦 إدارة المخازن (Inventory Management):** تتبع المنتجات، مستويات المخزون، وتنبيهات بنقص الكميات.
- **💰 المبيعات والمشتريات (Sales & Purchases):** إدارة كاملة للفواتير، العملاء، والموردين.
- **💸 إدارة المصروفات (Expenses):** تتبع المصاريف التشغيلية وتصنيفها.
- **🛡️ نظام اشتراكات متطور (Subscription System):** دعم الدفع عبر **InstaPay** و **Vodafone Cash** مع واجهة احترافية لتأكيد العمليات.
- **📄 تصدير التقارير (Reports Export):** إمكانية تصدير كافة البيانات والتقارير بصيغ **Excel (XLSX)** و **PDF (jsPDF)**.
- **🔐 نظام صلاحيات (Authentication):** حماية كاملة للمسارات (Route Guards) باستخدام JWT و Redux Middleware.
- **📱 متوافق مع كافة الأجهزة (Responsive Design):** تصميم مرن يعمل بكفاءة على الموبايل، التابلت، والحاسوب.

---

## 🛠 التقنيات المستخدمة (Tech Stack)

تم استخدام أحدث إصدارات المكتبات لضمان الاستقرار والأمان:
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Core:** [React 19](https://react.dev/)
- **Language:** [TypeScript 5+](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Redux Toolkit 2.x](https://redux-toolkit.js.org/)
- **API Client:** [Axios](https://axios-http.com/)
- **Animations:** [Framer Motion 12](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Chart.js](https://www.chartjs.org/) & [React Chartjs 2](https://react-chartjs-2.js.org/)
- **Notifications:** [Sonner](https://sonner.steventey.com/)

---

## 📁 هيكل المجلدات المنظم (Project Structure)

```text
src/
├── app/                # نظام التوجيه (App Router) والصفحات (Next.js 16)
│   ├── (auth)/         # صفحات الدخول والتسجيل
│   ├── dashboard/      # لوحة التحكم الرئيسية
│   ├── inventory/      # إدارة المنتجات والمخزون
│   ├── sales/          # إدارة المبيعات والفواتير
│   ├── purchases/      # إدارة المشتريات والموردين
│   ├── expenses/       # إدارة المصاريف
│   └── layout.tsx      # الهيكل العام والتكوين الأساسي
├── components/         # المكونات البرمجية
│   ├── layout/         # مكونات الهيكل (Sidebar, Navbar, MobileNav)
│   └── ui/             # مكونات الواجهة (Button, Modal, Table, Input)
├── services/           # طبقة التواصل مع الـ Backend (API Services)
├── store/              # إدارة الحالة العالمية (Redux Slices & Store)
├── types/              # تعريفات TypeScript الموحدة
├── lib/                # الإعدادات المساعدة (Axios, Date Utils)
└── public/             # الملفات الثابتة (الصور، الـ QR Codes)
```

---

## 🚀 التثبيت والتشغيل المحلي

### المتطلبات الأساسية
- **Node.js:** الإصدار 18 أو أحدث (يفضل LTS).
- **Package Manager:** npm (أو yarn/pnpm).

### خطوات التشغيل
1. قم بتحميل المستودع:
   ```bash
   git clone [repository-url]
   ```
2. تثبيت المكتبات:
   ```bash
   npm install
   ```
3. إعداد المتغيرات البيئية:
   قم بإنشاء ملف `.env.local` وأضف الرابط الخاص بالـ API:
   ```env
   NEXT_PUBLIC_API_URL=https://management-system-said2.vercel.app
   ```
4. تشغيل خادم التطوير:
   ```bash
   npm run dev
   ```
5. افتح [http://localhost:3000](http://localhost:3000).

---

## � نظام الدفع والاشتراكات

يدعم النظام واجهة دفع احترافية (PaymentModal) مصممة لتسهيل عمليات الاشتراك:
- **InstaPay QR:** مسح الكود مباشرة للدفع السريع.
- **Copy IPA:** نسخ عنوان الدفع اللحظي بضغطة زر.
- **Validation:** التحقق من بيانات الدفع قبل الإرسال لضمان الدقة.

---

## 🛠 الأوامر المتاحة (Available Commands)

- `npm run dev`: تشغيل بيئة التطوير.
- `npm run build`: بناء نسخة الإنتاج المحسنة.
- `npm run start`: تشغيل النسخة المبنية.
- `npm run lint`: فحص جودة الكود.
- `npm run clean`: تنظيف المجلدات المؤقتة.

---

## 🌍 المعايير والتوطين (RTL & Localization)

النظام مصمم خصيصاً للمستخدم العربي:
- **Direction:** دعم كامل لـ `dir="rtl"`.
- **Fonts:** استخدام خط **Cairo** المتميز بوضوحه في الواجهات الإدارية.
- **SEO:** إعدادات Metadata متقدمة لدعم محركات البحث.

---

## 📦 النشر (Deployment)

المشروع جاهز للنشر على **Vercel** أو أي منصة سحابية تدعم Next.js. يتم البناء والتحسين تلقائياً لضمان أعلى سرعة تحميل (Lighthouse Scores 90+).

---

**تطوير وصيانة:** [اسم المطور/الفريق]
**آخر تحديث:** مارس 2026 🚀
