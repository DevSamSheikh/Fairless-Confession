import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { soundEffects } from '../utils/soundEffects';

type FeedbackType = 'like' | 'comment' | 'post' | 'notification' | 'button' | 'error';

export const useInteractionFeedback = () => {
  const triggerFeedback = useCallback(async (type: FeedbackType) => {
    switch (type) {
      case 'like':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await soundEffects.play('like');
        break;
      
      case 'comment':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await soundEffects.play('comment');
        break;
      
      case 'post':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await soundEffects.play('post');
        break;
      
      case 'notification':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await soundEffects.play('notification');
        break;
      
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        await soundEffects.play('error');
        break;
      
      case 'button':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      
      default:
        Haptics.selectionAsync();
    }
  }, []);

  return { triggerFeedback };
};
