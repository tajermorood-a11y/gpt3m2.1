import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Screen, Header, Field, Btn, Panel, Txt } from '../../src/components/ui';
import { useAuth } from '../../src/store/authStore';
import { api } from '../../src/lib/api';
export default function AdminRoles(){const token=useAuth(s=>s.token);const [userId,setUserId]=useState('');const [busy,setBusy]=useState(false);const assign=async()=>{setBusy(true);try{await api.setRole(token,userId.trim(),'deputy');setUserId('');Alert.alert('تم','تم تعيين نائب المدير');}catch(e){Alert.alert('خطأ',e.message);}finally{setBusy(false);}};return <Screen><Header title="إدارة الصلاحيات"/><Panel><Txt>أدخل UUID حساب المستخدم المراد تعيينه نائباً للمدير الفني.</Txt><Field label="معرّف المستخدم UUID" value={userId} onChangeText={setUserId}/><Btn title="تعيين نائب مدير" loading={busy} disabled={!userId.trim()} onPress={assign}/></Panel></Screen>;}
