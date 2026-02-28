import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { soundEffects } from './soundEffects';
import { COLORS } from './constants';

const TOAST_CONFIG = {
  position: 'top' as const,
  visibilityTime: 3000,
  topOffset: 60,
};

export function showSuccessToast(message: string) {
  Toast.show({
    type: 'success',
    text1: message,
    ...TOAST_CONFIG,
  });
}

export function showErrorToast(message: string) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  soundEffects.play('error');
  Toast.show({
    type: 'error',
    text1: message,
    ...TOAST_CONFIG,
  });
}

export function showInfoToast(message: string) {
  Toast.show({
    type: 'info',
    text1: message,
    ...TOAST_CONFIG,
  });
}
