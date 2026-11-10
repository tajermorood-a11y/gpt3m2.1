# فانتوم (PHANTOM)

مشروع Expo React Native مستقل وفق مواصفات `phantom-app-spec.md`، مع قاعدة Supabase عبر RPC، وواجهة عربية RTL.

## 1) المتطلبات
- Node.js 18 أو 20 LTS
- npm
- حساب Expo وحساب Supabase

## 2) التثبيت

```bash
npm install
npx expo install
 npx expo start
```

للتأكد من الحزم:

```bash
npx expo-doctor
```

## 3) ربط Supabase
تم إنشاء مشروع Supabase الجديد وتطبيق المخطط عليه بالفعل.
- Project: `PHANTOM-APP`
- Project Reference: `bfzdnmeeijaokvtcfagf`
- Region: `eu-central-1` (Frankfurt)
- URL: `https://bfzdnmeeijaokvtcfagf.supabase.co`
- يستخدم التطبيق مفتاح publishable عام فقط في `src/constants/config.js`؛ لا تضع `service_role` أو أي secret key داخل التطبيق.

ملف `supabase/schema.sql` هو نسخة توثيقية قابلة لإعادة البناء على قاعدة جديدة. لا تشغّله مرة ثانية على قاعدة PHANTOM-APP الحالية؛ المخطط مطبّق بالفعل.

أنشئ حسابك الأول من التطبيق، ثم نفّذ في SQL Editor بعد استبدال اسم المستخدم:

```sql
update public.prediction_users set role='technical_manager' where username='your_username';
```

## 4) EAS Build

```bash
npm install -g eas-cli
eas login
eas init
eas build -p android --profile preview
```

`eas init` ينشئ ربط EAS جديداً ويضيف projectId جديداً. لا تضع أي projectId من مشروع آخر.

## 5) تحديث PHANTOM 2.0
- الشاشة الرئيسية تعرض المباريات مباشرة بعد تسجيل الدخول مع تصفية حسب المسابقة.
- الخط المحلي `Thamanya Serif Display Medium` مضمّن في `assets/fonts/` ويُحمّل قبل عرض التطبيق.
- شعار الواجهة يدعم SVG وWEBP: استبدل `assets/logo.svg` أو `assets/logo.webp`، ثم غيّر `APP_LOGO_FORMAT` في `src/constants/config.js` إلى `svg` أو `webp`.
- أيقونات Android/iOS الأصلية وشاشة الإقلاع تبقى PNG وفق متطلبات Expo؛ دعم SVG/WEBP مخصص لشعار الواجهة داخل التطبيق.
- تمت زيادة إصدار التطبيق إلى 2.0.0 ورقم بناء Android إلى 2.

## 6) إعدادات مهمة
- غيّر `android.package` و`ios.bundleIdentifier` في `app.json` إلى معرّف تملكه وتضمن فرادته قبل النشر العام.
- لا تضف `service_role` أو secret key إلى التطبيق. استخدم المفتاح العام فقط.
- لا توجد بوابات دفع داخل التطبيق؛ قيمة الكود المسجلة في قاعدة البيانات هي التي تضاف إلى الرصيد.
- كل عمليات البيانات تمر من `src/lib/api.js`.

## 7) ملاحظات أمان وتشغيل
- نموذج المصادقة مخصص كما في المواصفات، وليس Supabase Auth. الجلسة UUID عشوائية وتنتهي بعد 30 يوماً، وكلمات المرور مخزنة باستخدام bcrypt عبر pgcrypto.
- لا يتضمن نموذج الدخول المخصص حماية معدل طلبات على مستوى IP. قبل فتح التسجيل للعامة، أضف rate limiting ومراقبة إساءة الاستخدام على طبقة وسيطة أو Edge Function.
- لا توجد سياسات RLS مباشرة؛ الجداول مفعّل عليها RLS ومغلقة عن الوصول المباشر، والـ RPC هي واجهة التطبيق.
- نُقلت دوال `SECURITY DEFINER` إلى مخطط `phantom_private` غير المعرّض عبر Data API، وتبقى دوال `public` واجهات `SECURITY INVOKER`.
- يجب تعيين أول مدير فني يدوياً من SQL Editor بعد التسجيل.
- قبل فتح التسجيل للعامة، أضف rate limiting ومراقبة إساءة الاستخدام لعمليات التسجيل والدخول واسترداد الأكواد.
- SDK 51 وReact Native 0.74.5 كما حدد ملف المواصفات؛ تحقق من متطلبات Google Play الحالية قبل النشر، لأن المتاجر قد تشترط Android API أحدث.

قبل البناء بعد فك الضغط:
```bash
npm install
npx expo-doctor
npx expo start -c
```

## 8) محتويات المشروع
- `app/`: كل شاشات التطبيق ومسارات Expo Router.
- `src/`: API وSupabase وZustand والمكونات.
- `supabase/schema.sql`: الجداول والفهارس والدوال والصلاحيات.
- `assets/README.md`: مكان إضافة الشعارات يدوياً.
