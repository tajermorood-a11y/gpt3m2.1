import React from 'react';
import { View, Pressable } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/config';
import { Panel, Txt } from './ui';
import OddsPill from './OddsPill';
import ClubLogo from './ClubLogo';

function Team({ name, logo, score, showScore }) {
  return (
    <View style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 7 }}>
      <ClubLogo uri={logo} name={name} size={48} />
      <Txt numberOfLines={2} ellipsizeMode="tail" style={{ fontFamily: TYPOGRAPHY.medium, fontSize: 13, lineHeight: 19, textAlign: 'center', minHeight: 38 }}>{name}</Txt>
      {showScore ? <Txt style={{ color: COLORS.accent, fontFamily: TYPOGRAPHY.bold, fontSize: 20, fontVariant: ['tabular-nums'] }}>{score ?? '—'}</Txt> : null}
    </View>
  );
}

export default function MatchCard({ match, onPick, onOpen }) {
  const locked = match.status !== 'open' || new Date(match.kickoff_at) <= new Date();
  const finished = match.status === 'settled';
  const hasPick = !!match.my_pick;
  const statusLabel = finished ? 'انتهت المباراة' : locked ? 'التوقع مغلق' : 'التوقع متاح';
  const statusColor = finished ? COLORS.textDim : locked ? COLORS.warning : COLORS.success;
  const dateText = Number.isNaN(new Date(match.kickoff_at).getTime()) ? 'موعد غير محدد' : new Date(match.kickoff_at).toLocaleString('ar-IQ');
  const cardBody = (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Txt numberOfLines={1} style={{ color: COLORS.textDim, fontSize: 12, flex: 1 }}>{match.competition_name || 'مباراة'}</Txt>
        <View style={{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: COLORS.surfaceAlt }}>
          <Txt style={{ color: statusColor, fontFamily: TYPOGRAPHY.medium, fontSize: 11 }}>{statusLabel}</Txt>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 }}>
        <Team name={match.home_team} logo={match.home_logo_url} score={match.home_score} showScore={finished} />
        <View style={{ width: 48, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          {finished ? <Txt style={{ color: COLORS.textDim, fontSize: 11 }}>النتيجة</Txt> : <Txt style={{ color: COLORS.textDim, fontFamily: TYPOGRAPHY.bold, fontSize: 12 }}>VS</Txt>}
          <View style={{ width: 24, height: 2, borderRadius: 2, backgroundColor: COLORS.border }} />
        </View>
        <Team name={match.away_team} logo={match.away_logo_url} score={match.away_score} showScore={finished} />
      </View>
      <View style={{ height: 1, backgroundColor: COLORS.border }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Txt numberOfLines={1} style={{ color: COLORS.textDim, fontSize: 11, flex: 1 }}>{dateText}</Txt>
        <Txt numberOfLines={1} style={{ color: hasPick ? COLORS.success : locked ? COLORS.textDim : COLORS.accent, fontFamily: TYPOGRAPHY.medium, fontSize: 11, flexShrink: 0 }}>
          {hasPick ? `توقعك: ${match.my_pick === 'home' ? match.home_team : match.my_pick === 'away' ? match.away_team : 'تعادل'}` : locked ? 'التوقع مغلق' : 'تفاصيل المباراة'}
        </Txt>
      </View>
    </>
  );

  return (
    <Panel style={{ padding: 13, gap: 11 }}>
      {onOpen ? <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`تفاصيل مباراة ${match.home_team} ضد ${match.away_team}`} style={({ pressed }) => ({ gap: 11, opacity: pressed ? 0.84 : 1 })}>{cardBody}</Pressable> : cardBody}
      {onPick && !hasPick && !finished ? (
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {[
            { key: 'home', label: 'فوز المضيف', odds: match.odds_home },
            { key: 'draw', label: 'تعادل', odds: match.odds_draw },
            { key: 'away', label: 'فوز الضيف', odds: match.odds_away }
          ].map((option) => (
            <Pressable key={option.key} disabled={locked || !option.odds} onPress={() => onPick(match, option.key, option.odds)} style={{ flex: 1 }}>
              <OddsPill value={option.odds} label={option.label} disabled={locked || !option.odds} />
            </Pressable>
          ))}
        </View>
      ) : null}
      {onPick && (!match.odds_home || !match.odds_draw || !match.odds_away) ? <Txt style={{ color: COLORS.warning, textAlign: 'center', fontSize: 11 }}>بانتظار تحديد الأودز</Txt> : null}
    </Panel>
  );
}
