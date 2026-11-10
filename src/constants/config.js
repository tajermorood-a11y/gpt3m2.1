// Supabase public client configuration — retained from the supplied baseline.
// The publishable/anon key is intended for client-side use; database security
// must continue to be enforced by RLS and server-side RPC authorization.
export const SUPABASE_URL = 'https://bfzdnmeeijaokvtcfagf.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YhcrK6pSmMuTIWDZtegMgQ_dvS7G-ca';

// PHANTOM v3.0 design tokens.
// Keep all visual colors centralized here; legacy aliases preserve existing screens during M1.
export const COLORS = {
  bg: '#090A12',
  surface: '#12131D',
  surfaceAlt: '#191A27',
  surfaceElevated: '#202132',
  border: '#292B3B',
  primary: '#20C8E5',
  primaryDim: '#8BEAF5',
  accent: '#20C8E5',
  accentSoft: '#8BEAF5',
  onAccent: '#06232A',
  text: '#F5F6FA',
  textDim: '#A4A7B8',
  textMuted: '#8E92A6',
  success: '#28C77B',
  warning: '#F2B84B',
  danger: '#F06A72',
  disabled: '#55586A',
  overlay: '#000000AA',

  // Temporary compatibility aliases for existing components.
  starRed: '#F06A72',
  starGreen: '#28C77B',
  starYellow: '#F2B84B',
  tilePurple: '#202132',
  tileBlue: '#191A27'
};

export const TYPOGRAPHY = {
  regular: 'ThmanyahSans-Regular',
  medium: 'ThmanyahSans-Medium',
  bold: 'ThmanyahSans-Bold'
};

export const ODDS_MIN = 1;
export const ODDS_MAX = 2;
export const PAYMENT_METHODS = [
  { key: 'zain_cash', label: 'زين كاش' },
  { key: 'asia_pay', label: 'آسيا باي' },
  { key: 'mastercard', label: 'ماستركارد' }
];

// Change to 'webp' when you prefer assets/logo.webp instead of assets/logo.svg.
export const APP_LOGO_FORMAT = 'svg';
