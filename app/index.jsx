import React, { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Header, Btn, Txt, Panel, Empty } from '../src/components/ui';
import AppLogo from '../src/components/AppLogo';
import MatchCard from '../src/components/MatchCard';
import BalanceBox from '../src/components/BalanceBox';
import StarBadge from '../src/components/StarBadge';
import WalletModal from '../src/components/WalletModal';
import { useAuth } from '../src/store/authStore';
import { useApp } from '../src/store/appStore';
import { COLORS, TYPOGRAPHY } from '../src/constants/config';

export default function Home() {
  const router = useRouter();
  const { user, token, signOut, setUser } = useAuth();
  const { matches, competitions, loadMatches, loadCompetitions, loading } = useApp();
  const [wallet, setWallet] = useState(false);
  const [competition, setCompetition] = useState(null);
  const admin = ['deputy', 'technical_manager'].includes(user?.role);

  const refresh = async () => await Promise.all([loadCompetitions(token), loadMatches(token, competition)]);
  useEffect(() => {
    if (!token) return;
    refresh().catch((e) => Alert.alert('تعذر تحميل المباريات', e.message));
  }, [token, competition]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1, alignItems: 'flex-start', gap: 4 }}>
          <AppLogo width={132} height={40} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Txt numberOfLines={1} style={{ fontFamily: TYPOGRAPHY.medium, fontSize: 14 }}>أهلاً {user?.display_name || ''}</Txt>
            <StarBadge color={user?.star_color} size={16} />
          </View>
        </View>
        <Btn title="خروج" secondary onPress={async () => { await signOut(); router.replace('/login'); }} style={{ minHeight: 40, paddingHorizontal: 14 }} />
      </View>

      <View style={{ flexDirection: 'row', gap: 9 }}>
        <BalanceBox balance={user?.balance} onPress={() => setWallet(true)} />
        <Pressable onPress={() => router.push('/leaderboard')} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, minHeight: 112, borderRadius: 18, padding: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'space-between', opacity: pressed ? 0.86 : 1 })}>
          <View style={{ width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceElevated, borderWidth: 1, borderColor: COLORS.border }}><Txt style={{ color: COLORS.accent, fontFamily: TYPOGRAPHY.bold, fontSize: 17 }}>#</Txt></View>
          <View style={{ gap: 2 }}><Txt style={{ fontFamily: TYPOGRAPHY.medium, fontSize: 14 }}>لوحة الصدارة</Txt><Txt style={{ color: COLORS.textDim, fontSize: 11 }}>ترتيب المتنافسين</Txt></View>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 }}>
        <Header title="المباريات" subtitle="تابع المواجهات واختر توقعك" />
        <Pressable onPress={() => router.push('/competition')} hitSlop={8}><Txt style={{ color: COLORS.accent, fontFamily: TYPOGRAPHY.medium, fontSize: 12 }}>المسابقات</Txt></Pressable>
      </View>

      {competitions.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {[{ id: null, name: 'الكل' }, ...competitions].map((c) => (
            <Pressable key={c.id || 'all'} onPress={() => setCompetition(c.id)} style={{ backgroundColor: competition === c.id ? COLORS.primary : COLORS.surfaceAlt, borderWidth: 1, borderColor: competition === c.id ? COLORS.primary : COLORS.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 }}>
              <Txt style={{ color: competition === c.id ? COLORS.onAccent : COLORS.text, fontFamily: TYPOGRAPHY.medium, fontSize: 12 }}>{c.name}</Txt>
            </Pressable>
          ))}
        </View>
      ) : null}

      {loading ? <Panel><Txt style={{ textAlign: 'center', color: COLORS.textDim }}>جارٍ تحميل المباريات...</Txt></Panel> : matches.length ? matches.map((match) => (
        <MatchCard key={match.id} match={match} onOpen={() => router.push(`/match/${match.id}`)} />
      )) : <Empty text="لا توجد مباريات حالياً" />}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Btn title="التحديات" secondary onPress={() => router.push('/rivalry')} style={{ flex: 1 }} />
        {admin ? <Btn title="لوحة الإدارة" onPress={() => router.push('/admin')} style={{ flex: 1 }} /> : null}
      </View>
      <Txt style={{ color: COLORS.textMuted, textAlign: 'center', fontSize: 11 }}>PHANTOM · VERSION 3.0</Txt>
      <WalletModal visible={wallet} onClose={() => setWallet(false)} user={user} token={token} onUpdated={(next) => setUser(next)} />
    </Screen>
  );
}
