import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
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
  logoContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  version: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
});
