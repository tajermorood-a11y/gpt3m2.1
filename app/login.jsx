import React, { useState } from 'react';
import { COLORS } from '../src/constants/config';
import { Alert, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen, Header, Field, Btn, Panel, Txt } from '../src/components/ui';
import { useAuth } from '../src/store/authStore';
export default function Login() {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const signIn = useAuth((s) => s.signIn); const router = useRouter();
  const submit = async () => { if (!username.trim() || !password) return Alert.alert('تنبيه', 'أدخل اسم المستخدم وكلمة المرور'); setBusy(true); try { await signIn(username, password); router.replace('/'); } catch (e) { Alert.alert('تعذر تسجيل الدخول', e.message); } finally { setBusy(false); } };
  return <Screen style={{ justifyContent: 'center' }}><Header title="فانتوم" subtitle="مرحباً بعودتك إلى عالم التوقعات" /><Panel><Field label="اسم المستخدم" value={username} onChangeText={setUsername} /><Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry /><Btn title="تسجيل الدخول" loading={busy} onPress={submit} /><View style={{ alignItems: 'center' }}><Link href="/register" asChild><Txt style={{ color: COLORS.accent }}>إنشاء حساب جديد</Txt></Link></View></Panel></Screen>;
}
