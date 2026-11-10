import React from 'react';
import { View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/config';
import { Txt } from './ui';
export default function OddsPill({ value, label, disabled }) { return <View style={{ flex: 1, alignItems: 'center', padding: 9, borderRadius: 12, backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border, opacity: disabled ? 0.45 : 1 }}><Txt style={{ color: COLORS.accent, fontFamily: 'ThmanyahSans-Medium' }}>{value ? `${Number(value).toFixed(2)}x` : '—'}</Txt>{label ? <Txt style={{ fontSize: 11, color: COLORS.textDim }}>{label}</Txt> : null}</View>; }
