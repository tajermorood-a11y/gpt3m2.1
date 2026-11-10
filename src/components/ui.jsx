import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY } from '../constants/config';

export function Screen({ children, scroll = true, style }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }} edges={['top', 'bottom']}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28, gap: 16 }, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 16 }, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
export function Txt({ children, style, ...props }) {
  return <Text {...props} style={[{ color: COLORS.text, fontFamily: TYPOGRAPHY.regular, fontSize: 15, textAlign: 'right' }, style]}>{children}</Text>;
}
export function Heading({ children, style }) { return <Txt style={[{ fontFamily: TYPOGRAPHY.bold, fontSize: 21 }, style]}>{children}</Txt>; }
export function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default', autoCapitalize = 'sentences' }) {
  return (
    <View style={{ gap: 6 }}>
      <Txt style={{ color: COLORS.textDim, fontSize: 13 }}>{label}</Txt>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor={COLORS.textDim}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        textAlign="right"
        style={{ minHeight: 48, color: COLORS.text, backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 11, fontFamily: TYPOGRAPHY.regular, fontSize: 14 }}
      />
    </View>
  );
}
export function Btn({ title, onPress, disabled, loading, secondary, style }) {
  return (
    <Pressable disabled={disabled || loading} onPress={onPress} accessibilityRole="button" style={({ pressed }) => [
      { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16,
        backgroundColor: secondary ? COLORS.surfaceAlt : COLORS.primary, borderWidth: secondary ? 1 : 0,
        borderColor: COLORS.border, opacity: disabled ? 0.42 : pressed ? 0.82 : 1 }, style
    ]}>
      {loading ? <ActivityIndicator color={secondary ? COLORS.text : COLORS.onAccent} /> : <Txt style={{ fontFamily: TYPOGRAPHY.bold, color: secondary ? COLORS.text : COLORS.onAccent }}>{title}</Txt>}
    </Pressable>
  );
}
export function Panel({ children, style }) {
  return <View style={[{ backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 14, gap: 10 }, style]}>{children}</View>;
}
export function Empty({ text = 'لا توجد بيانات حالياً' }) { return <Panel><Txt style={{ color: COLORS.textDim, textAlign: 'center' }}>{text}</Txt></Panel>; }
export function Header({ title, subtitle }) { return <View style={{ gap: 3 }}><Heading>{title}</Heading>{subtitle ? <Txt style={{ color: COLORS.textDim, fontSize: 13 }}>{subtitle}</Txt> : null}</View>; }
