import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Dimensions, Image } from 'react-native';
import { COLORS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Unlock the Power\nOf Future AI',
    subtitle: 'Chat with the smartest AI Future\nExperience power of AI with us',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    title: 'Chat With Your\nFavourite AI',
    subtitle: 'Chat with the smartest AI Future\nExperience power of AI with us',
    image: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    title: 'Boost Your Mind\nPower with AI',
    subtitle: 'Chat with the smartest AI Future\nExperience power of AI with us',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd05a?auto=format&fit=crop&q=80&w=800',
  },
];

export const OnboardingScreen: React.FC = ({ navigation }: any) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex < SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index: nextSlideIndex });
      setCurrentSlideIndex(nextSlideIndex);
    } else {
      navigation.replace('Welcome');
    }
  };

  const goToPrevSlide = () => {
    const prevSlideIndex = currentSlideIndex - 1;
    if (prevSlideIndex >= 0) {
      flatListRef.current?.scrollToIndex({ index: prevSlideIndex });
      setCurrentSlideIndex(prevSlideIndex);
    }
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
           <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace('Welcome')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        pagingEnabled
        data={SLIDES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>

        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.navButton} onPress={goToPrevSlide} disabled={currentSlideIndex === 0}>
            <Text style={[styles.navButtonText, currentSlideIndex === 0 && styles.disabledText]}>←</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.navButton} onPress={goToNextSlide}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingTop: 80,
  },
  imageContainer: {
    width: width * 0.85,
    height: height * 0.45,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 40,
    backgroundColor: '#1A1D23',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
  },
  footer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  indicator: {
    height: 8,
    width: 8,
    backgroundColor: '#2A2E37',
    marginHorizontal: 4,
    borderRadius: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D23',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 60,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  navButton: {
    width: 50,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  disabledText: {
    color: '#2A2E37',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#2A2E37',
    marginHorizontal: 10,
  },
});
