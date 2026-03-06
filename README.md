# نظام إدارة المخازن والمبيعات - واجهة المستخدم (Frontend)

هذا هو مشروع واجهة المستخدم (Frontend) لنظام إدارة المخازن والمبيعات، تم بناؤه باستخدام إطار العمل **Next.js 16** مع **TypeScript** و **Tailwind CSS 4**. يوفر النظام واجهة احترافية وسهلة الاستخدام لإدارة المنتجات، المبيعات، المشتريات، والمصروفات مع دعم كامل للغة العربية (RTL).

---

## 📋 جدول المحتويات
- [المتطلبات الأساسية](#-المتطلبات-الأساسية)
- [تقنيات المشروع](#-تقنيات-المشروع)
- [هيكل المجلدات](#-هيكل-المجلدات)
- [التثبيت والتشغيل المحلي](#-التثبيت-والتشغيل-المحلي)
- [إعدادات البيئة (Environment Variables)](#-إعدادات-البيئة-environment-variables)
- [بنية التطبيق (Architecture)](#-بنية-التطبيق-architecture)
- [إدارة الحالة (State Management)](#-إدارة-الحالة-state-management)
- [التواصل مع Backend API](#-التواصل-مع-backend-api)
- [المعايير المتبعة (Coding Standards)](#-المعايير-المتبعة-coding-standards)
- [الأوامر المتاحة](#-الأوامر-المتاحة)

---

## 🛠 تقنيات المشروع

يعتمد المشروع على أحدث التقنيات لضمان الأداء العالي وسهولة الصيانة:
- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **API Client:** [Axios](https://axios-http.com/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Notifications:** [Sonner](https://sonner.steventey.com/)
- **Excel Export:** [XLSX](https://sheetjs.com/)

---

## 📁 هيكل المجلدات

تم تنظيم المشروع بشكل يسهل الوصول إلى المكونات والمنطق البرمجي:

```text
src/
├── app/                # نظام التوجيه (App Router) والصفحات والخطوط العالمية
│   ├── dashboard/      # صفحة لوحة التحكم الرئيسية
│   ├── sales/          # إدارة المبيعات
│   ├── purchases/      # إدارة المشتريات
│   ├── expenses/       # إدارة المصروفات
│   ├── login/          # صفحة تسجيل الدخول
│   ├── layout.tsx      # الهيكل العام للتطبيق (Root Layout) والـ SEO
│   └── globals.css     # التنسيقات العالمية
├── components/         # المكونات القابلة لإعادة الاستخدام
│   ├── layout/         # مكونات الهيكل (Sidebar, Navbar, MainLayout)
│   └── ui/             # مكونات الواجهة البسيطة (Button, Table, Input)
├── lib/                # المكتبات والإعدادات المساعدة (Axios Instance, Utils)
├── providers/          # مزودي السياق (Redux Provider, etc.)
├── services/           # خدمات التواصل مع API (API Services)
├── store/              # إعدادات Redux Toolkit (Slices, Store)
├── types/              # تعريفات TypeScript (Interfaces, Types)
└── public/             # الملفات الثابتة (الصور، الأيقونات)
```

---

## 🚀 التثبيت والتشغيل المحلي

### المتطلبات الأساسية
- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn أو pnpm

### خطوات التشغيل
1. قم بتحميل المستودع (Clone repository).
2. انتقل إلى مجلد المشروع:
   ```bash
   cd frontend-nextjs
   ```
3. قم بتثبيت التبعيات:
   ```bash
   npm install
   ```
4. قم بإنشاء ملف `.env.local` بناءً على `.env.example`.
5. ابدأ تشغيل خادم التطوير:
   ```bash
   npm run dev
   ```
6. افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

---

## ⚙️ إعدادات البيئة (Environment Variables)

يجب توفير المتغيرات التالية في ملف `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://management-system-said2.vercel.app  # رابط الـ Backend API
```

---

## 🏗 بنية التطبيق (Architecture)

### نظام التوجيه (Routing)
يعتمد المشروع على **App Router** الخاص بـ Next.js. يتم توزيع الصفحات في مجلدات داخل `src/app`. يتم استخدام `layout.tsx` لضمان ظهور الـ Sidebar والـ Navbar في جميع الصفحات المحمية.

### المكونات (Components)
- **UI Components:** توجد في `src/components/ui` وهي مكونات ذرية (Atomic) مثل الأزرار والجداول.
- **Layout Components:** توجد في `src/components/layout` وتتحكم في شكل الصفحة العام.

### إدارة الحالة (State Management)
يتم استخدام **Redux Toolkit** لإدارة الحالة العالمية، خاصة بيانات المستخدم (Auth) والجلسة.
- يتم تعريف الـ Slices في `src/store/slices`.
- يتم تغليف التطبيق بـ `StoreProvider` في `src/app/layout.tsx`.

---

## 🔌 التواصل مع Backend API

يتم استخدام **Axios** مع نظام **Interceptors** لإدارة الطلبات:
- يتم إرفاق التوكن (JWT) تلقائياً في كل طلب من خلال `src/lib/axios.ts`.
- يتم التعامل مع أخطاء 401 (انتهاء صلاحية الجلسة) وتوجيه المستخدم لصفحة تسجيل الدخول.
- يتم تنظيم طلبات API في مجلد `src/services` لتسهيل استدعائها في المكونات.

مثال على استدعاء API:
```typescript
import { saleService } from '@/services/api';

const fetchSales = async () => {
  const data = await saleService.getAll();
  // ...
};
```

---

## 🎨 المعايير المتبعة (Coding Standards)

- **التسمية:** استخدام `camelCase` للمتغيرات والدوال، و `PascalCase` للمكونات والملفات (مثل `Button.tsx`).
- **التنسيق:** الاعتماد الكلي على Tailwind CSS للتنسيقات.
- **TypeScript:** يجب تعريف الـ Types والـ Interfaces في `src/types` وتجنب استخدام `any`.
- **RTL:** يتم ضبط الاتجاه من اليمين لليسار في ملف `layout.tsx` باستخدام `dir="rtl"`.
- **SEO:** يتم ضبط Metadata في `layout.tsx` و `robots.ts` و `sitemap.ts`.

---

## 🛠 الأوامر المتاحة

في مجلد المشروع، يمكنك تشغيل:

- `npm run dev`: لتشغيل التطبيق في وضع التطوير.
- `npm run build`: لبناء التطبيق للإنتاج.
- `npm run start`: لتشغيل التطبيق المبني (بعد عمل build).
- `npm run lint`: لفحص جودة الكود واكتشاف الأخطاء.
- `npm run clean`: لمسح مجلد الـ build المؤقت.

---

## 🌍 التوطين واللغات
التطبيق مصمم حالياً للغة العربية بشكل أساسي مع استخدام خط **Cairo** لضمان تجربة مستخدم ممتازة. تم ضبط إعدادات اللغة في وسم الـ `html`:
```html
<html lang="ar" dir="rtl">
```

---

## 📦 البناء والنشر (Deployment)
المشروع مهيأ للنشر بسهولة على منصة **Vercel** أو أي منصة تدعم Next.js. عند البناء، يتم تحسين الصور والملفات لضمان أسرع وقت تحميل ممكن.

---

**تم إعداد هذا التوثيق لمساعدة المطورين الجدد على البدء بسرعة وكفاءة.**
**بالتوفيق في التطوير! 🚀**
