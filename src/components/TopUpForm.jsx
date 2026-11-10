import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { COLORS, PAYMENT_METHODS } from '../constants/config';
import { Btn, Field, Txt } from './ui';
export default function TopUpForm({ onRedeem, onCancel }) {
  const [amount, setAmount] = useState(''); const [method, setMethod] = useState('zain_cash'); const [code, setCode] = useState(''); const [busy, setBusy] = useState(false);
  return <View style={{ gap: 12 }}><Field label="المبلغ (للعرض فقط)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="المبلغ الذي دفعته" /><Txt style={{ color: COLORS.textDim }}>تتم إضافة قيمة الكود المسجّلة في النظام، وليس المبلغ المكتوب أعلاه.</Txt><Txt>وسيلة الدفع</Txt><View style={{ flexDirection: 'row-reverse', gap: 7 }}>{PAYMENT_METHODS.map((item) => <Pressable key={item.key} onPress={() => setMethod(item.key)} style={{ flex: 1, padding: 10, borderRadius: 10, backgroundColor: method === item.key ? COLORS.primary : COLORS.surfaceAlt, alignItems: 'center' }}><Txt style={{ fontSize: 11 }}>{item.label}</Txt></Pressable>)}</View><Field label="كود الشحن / الإحالة" value={code} onChangeText={setCode} placeholder="أدخل الكود" /><Btn title="إدخال الكود" loading={busy} disabled={!code.trim()} onPress={async () => { setBusy(true); try { await onRedeem(code.trim(), method); setCode(''); } finally { setBusy(false); } }} /><Btn title="إغلاق" secondary onPress={onCancel} /></View>;
}
