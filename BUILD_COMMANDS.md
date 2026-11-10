# أوامر بناء PHANTOM v3.0 M2

هذا الأرشيف يحتوي المشروع كاملاً، لا تنشئ مشروع Expo جديداً ولا تستبدل ملفات التطبيق.

```bash
cd phantom
npm install
npx expo-doctor
npx expo start -c
```

بعد نجاح فحص Expo، لبناء APK Android عبر EAS:

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

ملاحظات:
- المشروع مبني على Expo SDK 51 كما في النسخة المرفوعة؛ لم أقم بترقية SDK حتى لا أغيّر بيئة البناء الأساسية دون طلب.
- تم إصلاح إعدادات Supabase التي كانت مفقودة في M1؛ لا تحذف أو تستبدل صادرات `SUPABASE_URL` و`SUPABASE_ANON_KEY` من ملف الإعدادات.
- ملفا الخط المحلي موجودان في `assets/fonts/` (Regular / Medium / Bold).
- شعار الواجهة SVG افتراضياً. للتبديل إلى WEBP غيّر `APP_LOGO_FORMAT` في `src/constants/config.js` إلى `webp`.
- أيقونة تطبيق Android/iOS تبقى PNG داخل `app.json`؛ شعار SVG/WEBP يظهر داخل واجهة التطبيق.
- لا تنفّذ `supabase/schema.sql` على قاعدة PHANTOM الحالية.
