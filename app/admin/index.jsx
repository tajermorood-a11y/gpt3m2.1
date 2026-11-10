import React from 'react';
import { useRouter } from 'expo-router';
import { Screen, Header, Btn, Panel, Txt } from '../../src/components/ui';
import { useAuth } from '../../src/store/authStore';
export default function AdminHome() {
  const router = useRouter(); const user = useAuth((s) => s.user); const manager = user?.role === 'technical_manager';
  return <Screen><Header title="لوحة الإدارة" subtitle="إدارة المباريات والأكواد والصلاحيات" /><Panel><Txt>الصلاحية الحالية: {manager ? 'المدير الفني' : 'نائب المدير'}</Txt><Btn title="إدارة المباريات والأودز والنتائج" onPress={() => router.push('/admin/matches')} /><Btn title="إدارة أكواد الشحن" onPress={() => router.push('/admin/codes')} />{manager ? <Btn title="تعيين نائب مدير" onPress={() => router.push('/admin/roles')} /> : null}</Panel></Screen>;
}
