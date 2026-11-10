import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { COLORS } from '../constants/config';
import { Txt } from './ui';
const choices = [{ key: 'red', color: COLORS.starRed, label: 'حمراء' }, { key: 'green', color: COLORS.starGreen, label: 'خضراء' }, { key: 'yellow', color: COLORS.starYellow, label: 'صفراء' }];
export default function StarPicker({ value, onSelect }) { const [busy, setBusy] = useState(false); return <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-around' }}>{choices.map((item) => <Pressable key={item.key} disabled={busy} onPress={async () => { setBusy(true); try { await onSelect(item.key); } finally { setBusy(false); } }} style={{ alignItems: 'center', padding: 8, borderRadius: 12, backgroundColor: value === item.key ? COLORS.surfaceAlt : 'transparent' }}><Txt style={{ color: item.color, fontSize: 28 }}>★</Txt><Txt>{item.label}</Txt></Pressable>)}</View>; }
