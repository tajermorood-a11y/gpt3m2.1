import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { COLORS, TYPOGRAPHY } from '../constants/config';
import { Txt } from './ui';

export default function ClubLogo({ uri, name, size = 48 }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [uri]);
  const usable = typeof uri === 'string' && /^https:\/\/assets\.football-logos\.cc\/logos\/[a-z0-9-]+\/1500x1500\/[a-z0-9-]+\.[a-f0-9]+\.png$/.test(uri) && !failed;
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.25, backgroundColor: COLORS.surfaceAlt, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {usable ? (
        <ExpoImage source={{ uri }} style={{ width: size - 8, height: size - 8 }} contentFit="contain" cachePolicy="disk" transition={150} onError={() => setFailed(true)} />
      ) : (
        <Txt numberOfLines={1} style={{ color: COLORS.accentSoft, fontFamily: TYPOGRAPHY.bold, fontSize: Math.max(13, size * 0.34) }}>{(name || '?').trim().slice(0, 1)}</Txt>
      )}
    </View>
  );
}
