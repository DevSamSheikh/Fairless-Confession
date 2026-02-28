import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import * as Haptics from 'expo-haptics';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
}) => {
  const handleButtonPress = (button: AlertButton) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          
          {message && (
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message}</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'cancel' && styles.cancelButton,
                  button.style === 'destructive' && styles.destructiveButton,
                  index < buttons.length - 1 && styles.buttonBorder,
                ]}
                onPress={() => handleButtonPress(button)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  messageContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  message: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins_400Regular',
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBorder: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    fontFamily: 'Poppins_600SemiBold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  destructiveButton: {
    backgroundColor: 'transparent',
  },
  destructiveButtonText: {
    color: '#FF4B4B',
  },
});
