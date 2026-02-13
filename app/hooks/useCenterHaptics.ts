import { useRef, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SCREEN_CENTER = SCREEN_HEIGHT / 2;
const THRESHOLD = 3;

export const useCenterHaptics = () => {
  const lastCrossedIndexRef = useRef<number | null>(null);
  const itemLayoutsRef = useRef<{ [key: string]: { y: number; height: number } }>({});

  const onLayoutItem = useCallback((id: string, y: number, height: number) => {
    itemLayoutsRef.current[id] = { y, height };
  }, []);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    const layouts = itemLayoutsRef.current;

    let foundIndex: number | null = null;

    for (const [id, layout] of Object.entries(layouts)) {
      const cardCenter = layout.y - scrollOffset + layout.height / 2;
      
      // Check if cardCenter is within the threshold zone around SCREEN_CENTER
      if (Math.abs(cardCenter - SCREEN_CENTER) <= THRESHOLD) {
        const index = parseInt(id.split('-')[1]) || 0; // Assuming id is post-{index}
        if (lastCrossedIndexRef.current !== index) {
          Haptics.selectionAsync();
          lastCrossedIndexRef.current = index;
        }
        foundIndex = index;
        break;
      }
    }

    if (foundIndex === null) {
      // If we are not in any threshold zone, we can reset if we've moved significantly
      // This allows re-triggering when scrolling back
      lastCrossedIndexRef.current = null;
    }
  }, []);

  const onMomentumScrollEnd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  return {
    onLayoutItem,
    onScroll,
    onMomentumScrollEnd,
  };
};