import Toast from 'react-native-toast-message';
import { COLORS } from './constants';

export function showSuccessToast(message: string) {
  Toast.show({
    type: 'success',
    text1: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
  });
}

export function showErrorToast(message: string) {
  Toast.show({
    type: 'error',
    text1: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
  });
}

export function showInfoToast(message: string) {
  Toast.show({
    type: 'info',
    text1: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
  });
}
