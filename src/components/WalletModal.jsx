import React, { useEffect, useState } from 'react';
import { Modal, View, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/config';
import { api } from '../lib/api';
import { Btn, Heading, Panel, Txt, Empty } from './ui';
import TopUpForm from './TopUpForm';
import StarPicker from './StarPicker';
const typeLabels = { topup: 'شحن رصيد', stake: 'توقع', payout: 'أرباح', refund: 'استرجاع' };
export default function WalletModal({ visible, onClose, user, token, onUpdated }) {
  const [history, setHistory] = useState([]); const [topup, setTopup] = useState(false); const [busy, setBusy] = useState(false);
  const refresh = async () => setHistory((await api.walletHistory(token)) || []);
  useEffect(() => { if (visible && token) refresh().catch(() => setHistory([])); }, [visible, token]);
  const redeem = async (code, method) => { setBusy(true); try { const updated = await api.redeemCode(token, code, method); await onUpdated(updated); await refresh(); setTopup(false); } finally { setBusy(false); } };
  const chooseStar = async (color) => { const updated = await api.setStar(token, color); await onUpdated(updated); };
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' }}><View style={{ maxHeight: '92%', backgroundColor: COLORS.bg, padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 13 }}><Heading>المحفظة</Heading><Panel><Txt style={{ color: COLORS.textDim }}>رصيدك الحالي</Txt><Txt style={{ color: COLORS.accent, fontSize: 27, fontFamily: 'ThmanyahSans-Medium' }}>{Number(user?.balance || 0).toFixed(2)} نقطة</Txt><Txt style={{ color: user?.is_verified ? COLORS.success : COLORS.warning }}>{user?.is_verified ? 'حساب موثّق' : 'حساب غير موثّق'}</Txt>{user?.is_verified ? <><Txt>اختر لون نجمتك</Txt><StarPicker value={user.star_color} onSelect={chooseStar} /></> : null}</Panel>{topup ? <TopUpForm onRedeem={redeem} onCancel={() => setTopup(false)} /> : <><Btn title="شحن الرصيد" onPress={() => setTopup(true)} /><Txt style={{ fontFamily: 'ThmanyahSans-Medium' }}>سجل الحركات</Txt><ScrollView style={{ maxHeight: 260 }}>{history.length ? history.map((item) => <Panel key={item.id} style={{ marginBottom: 8 }}><View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}><Txt>{typeLabels[item.type] || item.type}</Txt><Txt style={{ color: item.type === 'stake' ? COLORS.danger : COLORS.success }}>{item.type === 'stake' ? '−' : '+'}{Number(item.amount).toFixed(2)}</Txt></View>{item.home_team ? <Txt style={{ color: COLORS.textDim }}>{item.home_team} × {item.away_team}</Txt> : null}<Txt style={{ color: COLORS.textDim, fontSize: 11 }}>{new Date(item.created_at).toLocaleString('ar-IQ')} · الرصيد بعد الحركة: {Number(item.balance_after).toFixed(2)}</Txt></Panel>) : <Empty text="لا توجد حركات مالية بعد" />}</ScrollView></>}<Btn title="إغلاق" secondary onPress={onClose} /></View></View></Modal>;
}
