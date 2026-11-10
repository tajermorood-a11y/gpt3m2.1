import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { Screen, Header, Field, Btn, Panel, Txt, Empty } from '../../src/components/ui';
import { useAuth } from '../../src/store/authStore';
import { useApp } from '../../src/store/appStore';
import { api } from '../../src/lib/api';
import { COLORS, TYPOGRAPHY } from '../../src/constants/config';
import ClubLogo from '../../src/components/ClubLogo';

const LOGO_PATTERN = /^https:\/\/assets\.football-logos\.cc\/logos\/[a-z0-9-]+\/1500x1500\/[a-z0-9-]+\.[a-f0-9]+\.png$/;
const clean = (value) => value.trim() || null;
const validLogo = (value) => !value.trim() || LOGO_PATTERN.test(value.trim());

export default function AdminMatches() {
  const { token } = useAuth();
  const { matches, loadMatches, loadCompetitions } = useApp();
  const [home, setHome] = useState(''); const [away, setAway] = useState(''); const [kickoff, setKickoff] = useState('');
  const [competition, setCompetition] = useState(''); const [competitionName, setCompetitionName] = useState('');
  const [homeLogo, setHomeLogo] = useState(''); const [awayLogo, setAwayLogo] = useState('');
  const [target, setTarget] = useState(null); const [h, setH] = useState(''); const [d, setD] = useState(''); const [a, setA] = useState('');
  const [hs, setHs] = useState(''); const [as, setAs] = useState(''); const [busy, setBusy] = useState(false);
  const [logoTarget, setLogoTarget] = useState(null); const [editHomeLogo, setEditHomeLogo] = useState(''); const [editAwayLogo, setEditAwayLogo] = useState('');
  const refresh = async () => { await Promise.all([loadMatches(token), loadCompetitions(token)]); };
  useEffect(() => { refresh().catch(e => Alert.alert('خطأ', e.message)); }, [token]);

  const createCompetition = async () => {
    if (!competitionName.trim()) return;
    try { await api.createCompetition(token, competitionName.trim()); setCompetitionName(''); await refresh(); Alert.alert('تم', 'تم إنشاء المسابقة'); }
    catch (e) { Alert.alert('خطأ', e.message); }
  };
  const create = async () => {
    if (!validLogo(homeLogo) || !validLogo(awayLogo)) return Alert.alert('رابط غير صالح', 'استخدم رابط PNG مباشراً من مصدر الشعارات المعتمد وبمسار 1500x1500.');
    const date = new Date(kickoff);
    if (Number.isNaN(date.getTime())) return Alert.alert('موعد غير صالح', 'أدخل تاريخاً ووقتاً صحيحين، ويفضل مع المنطقة الزمنية.');
    setBusy(true);
    try {
      await api.createMatch(token, competition || null, home.trim(), away.trim(), date.toISOString(), clean(homeLogo), clean(awayLogo));
      setHome(''); setAway(''); setKickoff(''); setHomeLogo(''); setAwayLogo('');
      await refresh(); Alert.alert('تم', 'تم إنشاء المباراة وحفظ روابط الشعارات');
    } catch (e) { Alert.alert('خطأ', e.message); }
    finally { setBusy(false); }
  };
  const odds = async () => {
    const values = [h, d, a].map(Number);
    if (values.some(v => !Number.isFinite(v) || v < 1 || v > 2)) return Alert.alert('تنبيه', 'يجب أن تكون جميع الأودز بين 1.00 و2.00');
    try { await api.setOdds(token, target.id, ...values); setTarget(null); await refresh(); Alert.alert('تم', 'تم حفظ الأودز'); }
    catch (e) { Alert.alert('خطأ', e.message); }
  };
  const settle = async () => {
    if (hs === '' || as === '' || Number(hs) < 0 || Number(as) < 0) return Alert.alert('تنبيه', 'أدخل نتيجة صحيحة');
    try { await api.settleMatch(token, target.id, Number(hs), Number(as)); setTarget(null); await refresh(); Alert.alert('تم', 'تم إنهاء المباراة وتسوية التوقعات'); }
    catch (e) { Alert.alert('خطأ', e.message); }
  };
  const openLogoEditor = (m) => { setLogoTarget(m); setEditHomeLogo(m.home_logo_url || ''); setEditAwayLogo(m.away_logo_url || ''); };
  const saveLogos = async () => {
    if (!validLogo(editHomeLogo) || !validLogo(editAwayLogo)) return Alert.alert('رابط غير صالح', 'الرابط يجب أن يكون PNG مباشراً من مصدر الشعارات المعتمد وبمسار 1500x1500.');
    setBusy(true);
    try { await api.setMatchLogos(token, logoTarget.id, clean(editHomeLogo), clean(editAwayLogo)); setLogoTarget(null); await refresh(); Alert.alert('تم', 'تم تحديث شعارات المباراة'); }
    catch (e) { Alert.alert('خطأ', e.message); }
    finally { setBusy(false); }
  };

  return (
    <Screen>
      <Header title="إدارة المباريات" subtitle="إضافة المباريات وتحديث الشعارات والأودز والنتائج" />
      <Panel>
        <Txt style={{ fontFamily: TYPOGRAPHY.bold, fontSize: 16 }}>إنشاء مسابقة</Txt>
        <Field label="اسم المسابقة الجديدة" value={competitionName} onChangeText={setCompetitionName} />
        <Btn title="إنشاء مسابقة" secondary disabled={!competitionName.trim()} onPress={createCompetition} />
      </Panel>
      <Panel>
        <Txt style={{ fontFamily: TYPOGRAPHY.bold, fontSize: 16 }}>إضافة مباراة</Txt>
        <Field label="الفريق المضيف" value={home} onChangeText={setHome} />
        <Field label="رابط شعار الفريق المضيف (اختياري)" value={homeLogo} onChangeText={setHomeLogo} placeholder="https://assets.football-logos.cc/...png" autoCapitalize="none" />
        <Field label="الفريق الضيف" value={away} onChangeText={setAway} />
        <Field label="رابط شعار الفريق الضيف (اختياري)" value={awayLogo} onChangeText={setAwayLogo} placeholder="https://assets.football-logos.cc/...png" autoCapitalize="none" />
        <Txt style={{ color: COLORS.textDim, fontSize: 11 }}>يجب أن يكون الرابط مباشراً بصيغة PNG ومن مسار 1500x1500 في مصدر الشعارات المعتمد.</Txt>
        <Field label="موعد الانطلاق" value={kickoff} onChangeText={setKickoff} placeholder="2026-12-01T20:00:00+03:00" autoCapitalize="none" />
        <Field label="معرّف المسابقة (اختياري)" value={competition} onChangeText={setCompetition} autoCapitalize="none" />
        <Btn title="إنشاء المباراة" loading={busy} disabled={!home.trim() || !away.trim() || !kickoff.trim()} onPress={create} />
      </Panel>

      <Header title="المباريات المسجلة" subtitle={`${matches.length} مباراة`} />
      {matches.length ? matches.map((m) => (
        <Panel key={m.id} style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, alignItems: 'center', gap: 5 }}><ClubLogo uri={m.home_logo_url} name={m.home_team} size={40} /><Txt numberOfLines={2} style={{ textAlign: 'center', fontFamily: TYPOGRAPHY.medium, fontSize: 12 }}>{m.home_team}</Txt></View>
            <Txt style={{ color: COLORS.textDim, fontFamily: TYPOGRAPHY.bold }}>VS</Txt>
            <View style={{ flex: 1, alignItems: 'center', gap: 5 }}><ClubLogo uri={m.away_logo_url} name={m.away_team} size={40} /><Txt numberOfLines={2} style={{ textAlign: 'center', fontFamily: TYPOGRAPHY.medium, fontSize: 12 }}>{m.away_team}</Txt></View>
          </View>
          <Txt style={{ color: COLORS.textDim, fontSize: 11, textAlign: 'center' }}>{m.status} · {new Date(m.kickoff_at).toLocaleString('ar-IQ')}</Txt>
          <View style={{ flexDirection: 'row', gap: 7 }}>
            <Btn title="الشعارات" secondary onPress={() => openLogoEditor(m)} style={{ flex: 1 }} />
            <Btn title="الأودز" onPress={() => { setTarget(m); setH(String(m.odds_home || '')); setD(String(m.odds_draw || '')); setA(String(m.odds_away || '')); setHs(''); setAs(''); }} style={{ flex: 1 }} />
            <Btn title="النتيجة" secondary onPress={() => { setTarget(m); setHs(''); setAs(''); setH(''); setD(''); setA(''); }} style={{ flex: 1 }} />
          </View>
        </Panel>
      )) : <Empty text="لا توجد مباريات" />}

      {logoTarget ? (
        <Panel>
          <Txt style={{ fontFamily: TYPOGRAPHY.bold }}>تحديث شعارات: {logoTarget.home_team} × {logoTarget.away_team}</Txt>
          <Field label="رابط شعار المضيف" value={editHomeLogo} onChangeText={setEditHomeLogo} autoCapitalize="none" />
          <Field label="رابط شعار الضيف" value={editAwayLogo} onChangeText={setEditAwayLogo} autoCapitalize="none" />
          <Txt style={{ color: COLORS.textDim, fontSize: 11 }}>اترك الحقل فارغاً لإزالة الشعار من المباراة.</Txt>
          <Btn title="حفظ الشعارات" loading={busy} onPress={saveLogos} />
          <Btn title="إلغاء" secondary onPress={() => setLogoTarget(null)} />
        </Panel>
      ) : null}

      {target ? (
        <Panel>
          <Txt style={{ fontFamily: TYPOGRAPHY.bold }}>{target.home_team} × {target.away_team}</Txt>
          {target.status === 'open' ? <>
            <Field label="أودز المضيف (1–2)" value={h} onChangeText={setH} keyboardType="decimal-pad" />
            <Field label="أودز التعادل (1–2)" value={d} onChangeText={setD} keyboardType="decimal-pad" />
            <Field label="أودز الضيف (1–2)" value={a} onChangeText={setA} keyboardType="decimal-pad" />
            <Btn title="حفظ الأودز" onPress={odds} />
          </> : null}
          <Field label="أهداف المضيف" value={hs} onChangeText={setHs} keyboardType="number-pad" />
          <Field label="أهداف الضيف" value={as} onChangeText={setAs} keyboardType="number-pad" />
          <Btn title="حفظ النتيجة وتسوية التوقعات" onPress={settle} />
          <Btn title="إلغاء" secondary onPress={() => setTarget(null)} />
        </Panel>
      ) : null}
    </Screen>
  );
}
