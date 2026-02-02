import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.brandName}>BrainBox</Text>
        <Text style={styles.version}>Version 1.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  version: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
});
