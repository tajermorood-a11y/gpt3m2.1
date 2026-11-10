import React, { useState } from 'react';
import { COLORS } from '../../src/constants/config';
import { Alert, View } from 'react-native';
import { Screen, Header, Field, Btn, Panel, Txt } from '../../src/components/ui';
import { useAuth } from '../../src/store/authStore';
import { api } from '../../src/lib/api';
import * as Clipboard from 'expo-clipboard';
export default function AdminCodes() {
  const token=useAuth(s=>s.token); const [amount,setAmount]=useState(''); const [count,setCount]=useState('1'); const [codes,setCodes]=useState([]); const [busy,setBusy]=useState(false);
  const generate=async()=>{if(Number(amount)<=0||Number(count)<1||Number(count)>100)return Alert.alert('تنبيه','أدخل مبلغاً وعدداً صالحين (حتى 100 كود)');setBusy(true);try{const result=await api.createCodes(token,Number(amount),Number(count));setCodes(result||[]);}catch(e){Alert.alert('خطأ',e.message);}finally{setBusy(false);}};
  return <Screen><Header title="أكواد الشحن" subtitle="أنشئ أكواداً لمرة واحدة"/><Panel><Field label="قيمة كل كود" value={amount} onChangeText={setAmount} keyboardType="decimal-pad"/><Field label="عدد الأكواد (1–100)" value={count} onChangeText={setCount} keyboardType="number-pad"/><Btn title="توليد الأكواد" loading={busy} onPress={generate}/></Panel>{codes.length?<Panel><Txt style={{fontFamily:'ThamanyaSerifMedium'}}>الأكواد الجديدة</Txt>{codes.map((code,i)=><View key={`${code}-${i}`} style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'}}><Txt style={{fontFamily:'ThamanyaSerifMedium',color:COLORS.accent}}>{code}</Txt><Btn title="نسخ" secondary style={{minHeight:34}} onPress={async()=>{try{await Clipboard.setStringAsync(code);Alert.alert('تم','تم نسخ الكود');}catch(e){Alert.alert('الكود',code);}}}/></View>)}<Btn title="نسخ الكل" onPress={async()=>{await Clipboard.setStringAsync(codes.join('\n'));Alert.alert('تم','تم نسخ جميع الأكواد');}}/></Panel>:null}</Screen>;
}
