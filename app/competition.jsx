import React, { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, Txt, Empty } from '../src/components/ui';
import MatchCard from '../src/components/MatchCard';
import StarBadge from '../src/components/StarBadge';
import ConfirmPredictionSheet from '../src/components/ConfirmPredictionSheet';
import { useAuth } from '../src/store/authStore';
import { useApp } from '../src/store/appStore';
import { api } from '../src/lib/api';
import { COLORS } from '../src/constants/config';
export default function Competition() {
  const { token, user, setUser } = useAuth(); const { matches, competitions, loadMatches, loadCompetitions, loading } = useApp();
  const [competition, setCompetition] = useState(null); const [selected, setSelected] = useState(null); const router = useRouter();
  const refresh = async () => { await Promise.all([loadCompetitions(token), loadMatches(token, competition)]); };
  useEffect(() => { refresh().catch((e) => Alert.alert('خطأ', e.message)); }, [token, competition]);
  const confirm = async (stake) => { try { const updated = await api.placePrediction(token, selected.match.id, selected.pick, stake); setUser(updated); setSelected(null); await loadMatches(token, competition); Alert.alert('تم', 'تم تسجيل توقعك بنجاح'); } catch (e) { Alert.alert('تعذر تسجيل التوقع', e.message); throw e; } };
  return <Screen><View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}><Header title="المسابقة" subtitle={`المشارك: ${user?.display_name || ''}`} /><StarBadge color={user?.star_color} size={18} /></View><View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 }}>{[{id:null,name:'الكل'}, ...competitions].map((c) => <Pressable key={c.id || 'all'} onPress={() => setCompetition(c.id)} style={{ backgroundColor: competition === c.id ? COLORS.primary : COLORS.surfaceAlt, padding: 9, borderRadius: 10 }}><Txt>{c.name}</Txt></Pressable>)}</View>{loading ? <Txt>جارٍ تحميل المباريات...</Txt> : matches.length ? matches.map((match) => <MatchCard key={match.id} match={match} onPick={(m,p,o) => setSelected({ match:m, pick:p, odds:o })} onOpen={() => router.push(`/match/${match.id}`)} />) : <Empty text="لا توجد مباريات حالياً" />}<ConfirmPredictionSheet visible={!!selected} match={selected?.match} pick={selected?.pick} odds={selected?.odds} balance={user?.balance} onClose={() => setSelected(null)} onConfirm={confirm} /></Screen>;
}
