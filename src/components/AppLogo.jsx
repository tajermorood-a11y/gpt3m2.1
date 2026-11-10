import React from 'react';
import { View } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import PhantomSvg from '../../assets/logo.svg';
import { APP_LOGO_FORMAT } from '../constants/config';

export default function AppLogo({ width = 164, height = 52 }) {
  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      {APP_LOGO_FORMAT === 'webp' ? (
        <ExpoImage source={require('../../assets/logo.webp')} style={{ width, height }} contentFit="contain" />
      ) : (
        <PhantomSvg width={width} height={height} />
      )}
    </View>
  );
}
