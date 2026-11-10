import React, { useState } from 'react';
import { Modal, View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/config';
import { Btn, Field, Heading, Panel, Txt } from './ui';
export default function ConfirmPredictionSheet({ visible, match, pick, odds, balance, onClose, onConfirm }) {
  const [stake, setStake] = useState(''); const [busy, setBusy] = useState(false);
  const amount = Number(stake) || 0; const choice = pick === 'home' ? match?.home_team : pick === 'away' ? match?.away_team : 'تعادل';
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' }}><View style={{ backgroundColor: COLORS.bg, padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, gap: 13 }}><Heading>تأكيد التوقع</Heading><Panel><Txt style={{ textAlign: 'center' }}>{match?.home_team} × {match?.away_team}</Txt><Txt style={{ color: COLORS.accent, textAlign: 'center', fontSize: 18 }}>الاختيار: {choice} · الأودز: {Number(odds || 0).toFixed(2)}x</Txt><Field label="مبلغ التوقع" value={stake} onChangeText={setStake} keyboardType="decimal-pad" placeholder="أدخل المبلغ" /><Txt>الربح المتوقع: <Txt style={{ color: COLORS.success }}>{(amount * Number(odds || 0)).toFixed(2)}</Txt></Txt><Txt>الرصيد بعد الخصم: {(Number(balance || 0) - amount).toFixed(2)}</Txt></Panel><Btn title="تأكيد التوقع" loading={busy} disabled={!amount || amount <= 0 || amount > Number(balance || 0)} onPress={async () => { setBusy(true); try { await onConfirm(amount); setStake(''); } finally { setBusy(false); } }} /><Btn title="إلغاء" secondary onPress={onClose} /></View></View></Modal>;
}
