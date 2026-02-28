# وثائق مشروع نظام إدارة المخازن (Next.js Version)

هذا المشروع هو إعادة بناء وتطوير للنظام السابق باستخدام تقنيات حديثة لضمان الأداء العالي وتجربة مستخدم متميزة.

## هيكل المشروع (Project Structure)

```text
src/
├── app/            # مسارات Next.js (App Router)
├── components/     # المكونات (UI & Layout)
├── services/       # طبقة الاتصال بالـ API (Axios)
├── store/          # إدارة الحالة (Redux Toolkit)
├── types/          # تعريفات TypeScript
├── lib/            # إعدادات المكتبات الخارجية
├── utils/          # وظائف مساعدة
└── hooks/          # خطافات مخصصة (Custom Hooks)
```

## التقنيات المستخدمة (Tech Stack)

- **Next.js 15 (App Router)**: للنظام الأساسي وتحسين SEO.
- **TypeScript**: لضمان سلامة البيانات وتجنب الأخطاء البرمجية.
- **Redux Toolkit**: لإدارة الحالة العالمية (Authentication).
- **Tailwind CSS**: لتصميم واجهة مستخدم متجاوبة وعصرية.
- **Lucide React**: لمجموعة الأيقونات المتنوعة.
- **Chart.js & React-Chartjs-2**: للرسوم البيانية المالية.
- **Axios**: للتعامل مع طلبات الـ API.
- **Sonner**: للإشعارات والتنبيهات.
- **Framer Motion**: للتحريك والانتقالات السلسة.

## دليل التشغيل والتركيب

1. **تثبيت التبعيات**:
   ```bash
   npm install
   ```

2. **إعداد المتغيرات البيئية**:
   أنشئ ملف `.env.local` وأضف الرابط الأساسي للـ API:
   ```env
   NEXT_PUBLIC_API_URL=https://management-system-said2.vercel.app
   ```

3. **تشغيل المشروع في بيئة التطوير**:
   ```bash
   npm run dev
   ```

4. **بناء المشروع للإنتاج**:
   ```bash
   npm run build
   ```

## الممارسات المطبقة

### 1. مبادئ SOLID و Clean Code
- تم فصل المنطق (Services) عن الواجهة (Components).
- استخدام المكونات المركبة (Compound Components) مثل مكون `Table`.
- تقسيم الوظائف لضمان سهولة الاختبار والتوسع.

### 2. الأمان (Security)
- استخدام JWT لتأمين الجلسات.
- حماية المسارات (Route Guards) عبر `MainLayout`.
- التحقق من صحة المدخلات (Input Validation).

### 3. الأداء (Performance)
- استخدام Code Splitting تلقائياً عبر Next.js.
- تحسين الصور (Image Optimization).
- استخدام Lazy Loading للمكونات الثقيلة.

### 4. SEO
- استخدام Metadata API لكل صفحة.
- إنشاء ملفات `sitemap.xml` و `robots.txt` تلقائياً.

## إرشادات التوسع في المستقبل
- لإضافة ميزة جديدة، ابدأ بتعريف الأنواع في `src/types`.
- أنشئ الخدمة المناسبة في `src/services/api.ts`.
- ابنِ الواجهة باستخدام المكونات الموجودة في `src/components/ui`.
- أضف المسار الجديد في `src/app`.
