import React from 'react';
import { Pressable, View } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/config';
import { Txt } from './ui';
export default function MainBox({ title, subtitle, icon, onPress, color = COLORS.primary }) { return <Pressable onPress={onPress} style={{ flex: 1, minHeight: 132, borderRadius: 18, padding: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'space-between' }}><View style={{ width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: color }}><Txt style={{ fontSize: 22 }}>{icon}</Txt></View><View style={{ gap: 3 }}><Txt style={{ fontFamily: 'ThmanyahSans-Medium', fontSize: 16 }}>{title}</Txt><Txt style={{ color: COLORS.textDim, fontSize: 11 }}>{subtitle}</Txt></View></Pressable>; }
