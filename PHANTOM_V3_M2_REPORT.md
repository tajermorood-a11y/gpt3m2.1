# PHANTOM v3.0 M2 — Startup Fix & Static Validation

## Critical startup defect fixed
The M1 rewrite of `src/constants/config.js` removed the two exports still imported by `src/lib/supabase.js`: `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The Supabase client is created during module initialization, before the first screen renders. With both values undefined, client initialization can throw immediately, matching the reported behaviour where Android closes the app as soon as its icon is tapped.

M2 restores the exact public Supabase project URL and publishable key from the user's original `gpt2.0.zip` configuration. It also adds an explicit configuration guard so a future missing value produces a clear diagnostic instead of an opaque SDK initialization failure. No database endpoint, schema, RPC, credentials table, or records were changed.

## Preserved
- Odds and the existing odds display / prediction flow.
- Existing Supabase RPC calls and client authentication flow.
- Existing routes, screens, stores, and payment/top-up components.
- Android package ID `com.tajermorood.phantom`.
- Thmanyah Sans Regular, Medium and Bold OTF files and font registration.
- Expo SDK 51 / React Native 0.74.5 dependency baseline.

## Build metadata
- App/package version: `3.0.0`
- Android `versionCode`: `4` (incremented from M1 so this build can replace M1)
- iOS `buildNumber`: `4`

## Static checks performed
- ZIP archive integrity checked after packaging.
- All three supplied Thmanyah Sans OTF files parsed successfully.
- All JS/JSX source files parsed with the installed TypeScript JSX parser.
- Local relative import and static asset paths checked.
- All named imports from `src/constants/config.js` checked against its exports.
- Required Supabase URL/key exports verified present and non-empty.
- Odds constants and the existing prediction API/schema files retained.

## Not performed / limitation
No Android APK/AAB was built in this environment; dependencies were not installed, and no physical Android device was available for runtime testing. Therefore this package addresses the confirmed startup defect and passes static checks, but device-level success still needs to be confirmed by installing the new build.
