import React, { useEffect } from 'react';
import { I18nManager, View, ActivityIndicator } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { useAuth } from '../src/store/authStore';
import { COLORS } from '../src/constants/config';
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'ThmanyahSans-Regular': require('../assets/fonts/ThmanyahSans-Regular.otf'),
    'ThmanyahSans-Medium': require('../assets/fonts/ThmanyahSans-Medium.otf'),
    'ThmanyahSans-Bold': require('../assets/fonts/ThmanyahSans-Bold.otf')
  });
  const { token, user, ready, hydrate } = useAuth();
  const pathname = usePathname(); const router = useRouter();
  useEffect(() => { hydrate(); }, []);
  useEffect(() => {
    if (!ready) return;
    const publicRoute = pathname === '/login' || pathname === '/register';
    if (!token && !publicRoute) router.replace('/login');
    else if (token && publicRoute) router.replace('/');
    else if (token && pathname.startsWith('/admin') && !['deputy', 'technical_manager'].includes(user?.role)) router.replace('/');
  }, [ready, token, user?.role, pathname]);
  if (!fontsLoaded || !ready) return <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={COLORS.accent} /></View>;
  return <><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg }, animation: 'fade' }} /></>;
}
