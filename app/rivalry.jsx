import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Screen, Header, Field, Btn, Panel, Txt, Empty } from '../src/components/ui';
import { useAuth } from '../src/store/authStore';
import { useApp } from '../src/store/appStore';
import { api } from '../src/lib/api';
import { COLORS } from '../src/constants/config';
export default function Rivalry() {
  const { token } = useAuth(); const { rivalries, loadRivalries } = useApp(); const [username, setUsername] = useState(''); const [busy, setBusy] = useState(false);
  const refresh = () => loadRivalries(token).catch((e) => Alert.alert('خطأ', e.message)); useEffect(() => { refresh(); }, [token]);
  const send = async () => { if (!username.trim()) return; setBusy(true); try { await api.createRivalry(token, username.trim()); setUsername(''); await refresh(); Alert.alert('تم', 'تم إرسال التحدي'); } catch (e) { Alert.alert('تعذر إرسال التحدي', e.message); } finally { setBusy(false); } };
  const respond = async (id, accept) => { try { await api.respondRivalry(token, id, accept); await refresh(); } catch (e) { Alert.alert('خطأ', e.message); } };
  return <Screen><Header title="التحدي" subtitle="تحدَّ مستخدماً آخر وقارن النتائج" /><Panel><Field label="اسم المستخدم" value={username} onChangeText={setUsername} placeholder="اسم المنافس" /><Btn title="إرسال تحدٍّ" loading={busy} onPress={send} disabled={!username.trim()} /></Panel>{rivalries.length ? rivalries.map((r) => <Panel key={r.id}><Txt style={{ fontFamily: 'ThamanyaSerifMedium' }}>{r.opponent_name || r.challenger_name || 'منافس'}</Txt><Txt style={{ color: COLORS.textDim }}>الحالة: {({pending:'معلّق',active:'فعّال',declined:'مرفوض',finished:'منتهٍ'})[r.status] || r.status}</Txt>{r.status === 'pending' && r.is_opponent ? <View style={{ flexDirection: 'row-reverse', gap: 8 }}><View style={{ flex: 1 }}><Btn title="قبول" onPress={() => respond(r.id, true)} /></View><View style={{ flex: 1 }}><Btn title="رفض" secondary onPress={() => respond(r.id, false)} /></View></View> : null}{r.status === 'active' ? <Txt>نتائجكما الصحيحة: {r.my_wins || 0} - {r.opponent_wins || 0}</Txt> : null}</Panel>) : <Empty text="لا توجد تحديات حتى الآن" />}</Screen>;
}
