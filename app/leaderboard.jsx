import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Screen, Header, Panel, Txt, Empty } from '../src/components/ui';
import StarBadge from '../src/components/StarBadge';
import { useAuth } from '../src/store/authStore';
import { useApp } from '../src/store/appStore';
import { COLORS } from '../src/constants/config';
export default function Leaderboard() {
  const { token, user } = useAuth(); const { leaderboard, loadLeaderboard } = useApp();
  useEffect(() => { loadLeaderboard(token).catch(() => {}); }, [token]);
  return <Screen><Header title="لوحة الصدارة" subtitle="الأكثر فوزاً ثم الأعلى ربحاً" />{leaderboard.length ? leaderboard.map((row, index) => <Panel key={row.id} style={{ borderColor: row.id === user?.id ? COLORS.accent : COLORS.border }}><View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}><View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}><Txt style={{ color: COLORS.accent, fontFamily: 'ThamanyaSerifMedium' }}>#{index + 1}</Txt><Txt style={{ fontFamily: 'ThamanyaSerifMedium' }}>{row.display_name}</Txt><StarBadge color={row.star_color} /></View><Txt style={{ color: COLORS.success }}>{Number(row.net_profit || 0).toFixed(2)}</Txt></View><Txt style={{ color: COLORS.textDim }}>التوقعات الصحيحة: {row.wins || 0} / {row.total || 0}</Txt></Panel>) : <Empty text="لا توجد نتائج في لوحة الصدارة بعد" />}</Screen>;
}
