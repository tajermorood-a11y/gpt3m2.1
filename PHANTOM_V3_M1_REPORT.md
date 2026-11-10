# PHANTOM v3.0 — M1 Design System Delivery

## Completed in this package
- Added the three supplied Thmanyah Sans OTF weights under `assets/fonts/`.
- Registered Regular, Medium and Bold as separate Expo font families.
- Replaced the active legacy font registration with the three approved weights.
- Centralized the v3.0 dark/cyan palette in `src/constants/config.js`.
- Preserved compatibility aliases so existing screens are not broken by token renaming.
- Updated shared text primitives: Regular body text, Bold headings and primary button labels.
- Updated app version/build metadata to 3.0.0 / Android versionCode 3 / iOS buildNumber 3.
- Kept existing routes, Supabase schema, RPC calls, match records and prediction logic unchanged.

## Explicitly not changed
- No database SQL was executed.
- No Supabase tables, columns, policies, functions or records were modified.
- Odds remain enabled in the existing prediction flow.
- Existing stake, balance and top-up flows remain untouched pending an explicit owner decision on the v3.0 economy model.
- Existing screen layouts are not yet fully migrated to the final design system; this is the M1 foundation, not a completed release.

## Remaining M1 acceptance checks
1. Install dependencies using the existing lockfile/package setup.
2. Run Expo Doctor and resolve any environment-specific warnings.
3. Launch on a real Android device and verify all three font weights render.
4. Verify 320 / 360 / 412 dp layouts and font scale 1.3.
5. Validate contrast for every remaining legacy component and migrate them to tokens.
6. Visually approve the Button, MatchCard and BalanceBox before rolling the system across all screens.

## Important owner decision still required before economy implementation
The specification allows odds only within the virtual-points economy. It does not authorize real-money deposits, withdrawals or payment processing. Confirm whether v3.0 should:
- keep virtual points with a stake and payout formula (recommended formula in the master spec: payout = stake × odds snapshot), while removing real-money top-up/payment features; or
- use another explicitly defined points-only model.

No economy or database changes are included in this package.
