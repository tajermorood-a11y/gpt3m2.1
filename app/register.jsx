import React, { useState } from 'react';
import { COLORS } from '../src/constants/config';
import { Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Screen, Header, Field, Btn, Panel, Txt } from '../src/components/ui';
import { useAuth } from '../src/store/authStore';
export default function Register() {
  const [username, setUsername] = useState(''); const [displayName, setDisplayName] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const signUp = useAuth((s) => s.signUp); const router = useRouter();
  const submit = async () => { if (username.trim().length < 3 || displayName.trim().length < 2 || password.length < 6) return Alert.alert('تنبيه', 'اسم المستخدم 3 أحرف على الأقل، والاسم الظاهر حرفان، وكلمة المرور 6 أحرف على الأقل'); setBusy(true); try { await signUp(username, password, displayName); router.replace('/'); } catch (e) { Alert.alert('تعذر إنشاء الحساب', e.message); } finally { setBusy(false); } };
  return <Screen style={{ justifyContent: 'center' }}><Header title="إنشاء حساب" subtitle="أنشئ حسابك وابدأ التوقع" /><Panel><Field label="الاسم الظاهر" value={displayName} onChangeText={setDisplayName} /><Field label="اسم المستخدم" value={username} onChangeText={setUsername} /><Field label="كلمة المرور" value={password} onChangeText={setPassword} secureTextEntry /><Btn title="إنشاء الحساب" loading={busy} onPress={submit} /><Link href="/login" asChild><Txt style={{ color: COLORS.accent, textAlign: 'center' }}>لديك حساب؟ تسجيل الدخول</Txt></Link></Panel></Screen>;
}
