import { supabase } from './supabase';

const ERRORS = {
  SESSION_INVALID: 'انتهت الجلسة، سجّل الدخول من جديد', FORBIDDEN: 'ليست لديك صلاحية',
  USERNAME_TAKEN: 'اسم المستخدم مستخدم مسبقاً', PASSWORD_TOO_SHORT: 'كلمة المرور قصيرة (6 أحرف على الأقل)',
  BAD_CREDENTIALS: 'اسم المستخدم أو كلمة المرور غير صحيحة', MATCH_CLOSED: 'هذه المباراة مغلقة للتوقع',
  ODDS_NOT_SET: 'لم تُحدد الأودز لهذه المباراة بعد', INSUFFICIENT_BALANCE: 'رصيدك غير كافٍ',
  CODE_INVALID: 'الكود غير صحيح', CODE_USED: 'هذا الكود مستخدم مسبقاً', NOT_VERIFIED: 'يجب توثيق حسابك أولاً بالشحن',
  ODDS_OUT_OF_RANGE: 'الأودز يجب أن تكون بين 1 و2', BAD_STAKE: 'مبلغ غير صالح', BAD_INPUT: 'البيانات المدخلة غير صالحة',
  MATCH_NOT_OPEN: 'المباراة غير متاحة لتعديل الأودز', INVALID_LOGO_URL: 'رابط الشعار غير صالح أو لا يطابق مصدر الشعارات المعتمد', MATCH_NOT_FOUND: 'لم يتم العثور على المباراة', MATCH_NOT_SETTLEABLE: 'لا يمكن إنهاء هذه المباراة',
  OPPONENT_NOT_FOUND: 'لم يتم العثور على المستخدم', RIVALRY_NOT_PENDING: 'هذا التحدي لم يعد معلقاً',
  SAME_USER: 'لا يمكنك تحدي حسابك', ROLE_INVALID: 'الدور المطلوب غير صالح',
  DUPLICATE_KEY: 'لديك توقع مسجل لهذه المباراة', BAD_METHOD: 'وسيلة الدفع غير صحيحة', RIVALRY_EXISTS: 'يوجد تحدٍ قائم بينكما',
  LOGIN_TEMPORARILY_LOCKED: 'تم إيقاف تسجيل الدخول مؤقتاً بسبب محاولات فاشلة', USER_NOT_FOUND_OR_ROLE_LOCKED: 'المستخدم غير موجود أو لا يمكن تغيير دوره'
};

async function call(fn, args = {}) {
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    const raw = `${error.message || ''} ${error.details || ''}`;
    const key = Object.keys(ERRORS).find((item) => raw.includes(item)) || (raw.includes('duplicate key') ? 'DUPLICATE_KEY' : 'UNKNOWN');
    const err = new Error(ERRORS[key] || 'حدث خطأ غير متوقع، حاول مرة أخرى');
    err.code = key;
    throw err;
  }
  return data;
}

export const api = {
  register: (username, password, displayName) => call('register', { p_username: username, p_password: password, p_display_name: displayName }),
  login: (username, password) => call('login', { p_username: username, p_password: password }),
  getMe: (token) => call('get_me', { p_token: token }),
  logout: (token) => call('logout', { p_token: token }),
  listMatches: (token, competition = null) => call('list_matches', { p_token: token, p_competition: competition }),
  placePrediction: (token, match, pick, stake) => call('place_prediction', { p_token: token, p_match: match, p_pick: pick, p_stake: stake }),
  walletHistory: (token) => call('wallet_history', { p_token: token }),
  redeemCode: (token, code, method) => call('redeem_code', { p_token: token, p_code: code, p_method: method }),
  setStar: (token, color) => call('set_star', { p_token: token, p_color: color }),
  leaderboard: (token) => call('leaderboard', { p_token: token }),
  setOdds: (token, match, home, draw, away) => call('set_odds', { p_token: token, p_match: match, p_home: home, p_draw: draw, p_away: away }),
  settleMatch: (token, match, homeScore, awayScore) => call('settle_match', { p_token: token, p_match: match, p_home_score: homeScore, p_away_score: awayScore }),
  createCodes: (token, amount, count) => call('create_codes', { p_token: token, p_amount: amount, p_count: count }),
  createMatch: (token, competition, home, away, kickoff, homeLogoUrl = null, awayLogoUrl = null) => call('create_match_with_logos', { p_token: token, p_competition: competition || null, p_home: home, p_away: away, p_kickoff: kickoff, p_home_logo_url: homeLogoUrl || null, p_away_logo_url: awayLogoUrl || null }),
  setMatchLogos: (token, match, homeLogoUrl, awayLogoUrl) => call('set_match_logos', { p_token: token, p_match: match, p_home_logo_url: homeLogoUrl || null, p_away_logo_url: awayLogoUrl || null }),
  listCompetitions: (token) => call('list_competitions', { p_token: token }),
  createCompetition: (token, name) => call('create_competition', { p_token: token, p_name: name }),
  createRivalry: (token, username) => call('create_rivalry', { p_token: token, p_opponent_username: username }),
  respondRivalry: (token, id, accept) => call('respond_rivalry', { p_token: token, p_rivalry_id: id, p_accept: accept }),
  listRivalries: (token) => call('list_rivalries', { p_token: token }),
  setRole: (token, userId, role) => call('set_role', { p_token: token, p_user_id: userId, p_role: role })
};
