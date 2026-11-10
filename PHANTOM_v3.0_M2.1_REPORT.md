# PHANTOM v3.0 M2.1 — Implementation Report

## App changes
- Rebuilt match cards to display the home and away club crests from the database URLs, using contained image rendering, disk caching, and a neutral initials fallback when a URL is missing or fails.
- Match-list cards are single navigation targets; the odds/prediction options remain on the match-detail screen.
- Reworked the home screen hierarchy and made the balance/leaderboard tiles compact and side-by-side on mobile.
- Replaced the shared screen wrapper with SafeAreaView and a content-sized ScrollView (no flex-growing inner content view), so content no longer artificially stretches vertically and safe areas are respected.
- Added crest URL fields when creating a match and a crest editor for already existing matches in Admin → Matches.
- Kept the three Thmanyah Sans fonts, dark/cyan theme, app identifier, Supabase data model, odds and prediction logic.
- Android versionCode and iOS buildNumber are now 5.

## Supabase changes applied
Project: `bfzdnmeeijaokvtcfagf` (PHANTOM-APP).
1. `phantom_match_crest_rpcs`: added admin-validated RPCs `create_match_with_logos` and `set_match_logos`. URLs are validated against the existing football-logos.cc PNG URL format.
2. `phantom_match_competition_labels`: extended the match-list payload with `competition_name`, while retaining both crest URL fields and all existing prediction/odds fields.

The columns `matches.home_logo_url` and `matches.away_logo_url` already existed. No duplicate columns were created. No match, prediction, user, wallet, or odds records were changed by these migrations.

## Existing match data
A read-only inspection found 51 match rows. All 51 currently have `home_logo_url` and `away_logo_url` set to NULL. Therefore the updated app will show a neutral fallback until the administrator fills the URLs through Admin → Matches → الشعارات. The build does not invent club image URLs or risk assigning the wrong crest.

## Verification performed
- Both Supabase migrations applied successfully.
- Verified both new RPCs exist and the `anon` role can execute the public wrappers.
- Confirmed the database still contains 51 matches and no match rows were modified by the migrations.
- Supabase security advisor showed existing warnings for RLS-enabled tables without policies and four unrelated SECURITY DEFINER code-panel RPCs; it did not identify the new crest RPCs as findings.
- TypeScript compiler parser check completed for all app JS/JSX files with no syntax errors (`tsc --noEmit --allowJs --checkJs false --jsx react --noResolve ...`).
- ZIP integrity test passed.

## Not performed
- `npm install` did not complete within the available runtime window.
- No EAS APK/AAB build or physical Android device test was run.
- Existing club crest URLs have not been populated because verified direct URLs for each of the current teams were not available during this build.
