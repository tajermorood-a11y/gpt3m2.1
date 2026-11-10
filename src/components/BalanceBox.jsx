import React from 'react';
import { Pressable, View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/config';
import { Txt } from './ui';
export default function BalanceBox({ balance, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, minHeight: 112, borderRadius: 18, padding: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.accent, justifyContent: 'space-between', opacity: pressed ? 0.86 : 1 })}>
      <View style={{ width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border }}><Txt style={{ color: COLORS.accent, fontFamily: TYPOGRAPHY.bold, fontSize: 18 }}>◈</Txt></View>
      <View style={{ gap: 2 }}>
        <Txt style={{ color: COLORS.textDim, fontFamily: TYPOGRAPHY.medium, fontSize: 12 }}>الرصيد</Txt>
        <Txt numberOfLines={1} adjustsFontSizeToFit style={{ color: COLORS.accent, fontFamily: TYPOGRAPHY.bold, fontSize: 19, fontVariant: ['tabular-nums'] }}>{Number(balance || 0).toLocaleString('en-US')} نقطة</Txt>
      </View>
    </Pressable>
  );
}
