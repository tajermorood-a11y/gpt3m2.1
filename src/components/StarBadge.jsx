import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/config';
const colorMap = { red: COLORS.starRed, green: COLORS.starGreen, yellow: COLORS.starYellow };
export default function StarBadge({ color, size = 16 }) { if (!color || !colorMap[color]) return null; return <View style={{ width: size + 4, height: size + 4, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colorMap[color], fontSize: size }}>★</Text></View>; }
