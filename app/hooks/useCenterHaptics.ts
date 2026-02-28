import { useRef, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCREEN_CENTER = SCREEN_HEIGHT / 2;
const TRIGGER_THRESHOLD = 50;
const RESET_THRESHOLD = 150;

export const useCenterHaptics = () => {
  const triggeredCardsRef = useRef<Set<number>>(new Set());
  const itemLayoutsRef = useRef<{ [key: string]: { y: number; height: number } }>({});
  const lastScrollYRef = useRef<number>(0);

  const onLayoutItem = useCallback((id: string, y: number, height: number) => {
    itemLayoutsRef.current[id] = { y, height };
  }, []);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    const layouts = itemLayoutsRef.current;
    
    const scrollDelta = scrollOffset - lastScrollYRef.current;
    const velocity = Math.abs(scrollDelta);
    lastScrollYRef.current = scrollOffset;

    for (const [id, layout] of Object.entries(layouts)) {
      const index = parseInt(id.split('-')[1]);
      if (isNaN(index)) continue;
      
      const cardTop = layout.y - scrollOffset;
      const cardCenter = cardTop + layout.height / 2;
      
      const distanceFromCenter = Math.abs(cardCenter - SCREEN_CENTER);
      
      if (distanceFromCenter <= TRIGGER_THRESHOLD) {
        if (!triggeredCardsRef.current.has(index)) {
          triggeredCardsRef.current.add(index);
          
          if (velocity > 20) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else if (velocity > 5) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
      } else if (distanceFromCenter > RESET_THRESHOLD) {
        triggeredCardsRef.current.delete(index);
      }
    }
  }, []);

  const onMomentumScrollEnd = useCallback(() => {
    triggeredCardsRef.current.clear();
  }, []);

  return {
    onLayoutItem,
    onScroll,
    onMomentumScrollEnd,
  };
};