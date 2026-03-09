// Custom Alert Component
// Modern UI replacement for default React Native Alert

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from "../../styles";

const { width: screenWidth } = Dimensions.get("window");

interface AlertProps {
  visible: boolean;
  title: string;
  message?: string;
  type?: "info" | "success" | "warning" | "error";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const CustomAlert: React.FC<AlertProps> = ({
  visible,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return { icon: "checkmark-circle" as const, color: COLORS.success };
      case "warning":
        return { icon: "warning" as const, color: COLORS.warning };
      case "error":
        return { icon: "close-circle" as const, color: COLORS.error };
      default:
        return { icon: "information-circle" as const, color: COLORS.info };
    }
  };

  const { icon, color } = getIconAndColor();

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[styles.iconContainer, { backgroundColor: `${color}20` }]}
            >
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {cancelText && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: color },
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.modal.margin.horizontal,
  },
  container: {
    backgroundColor: COLORS.modal.background,
    borderRadius: 16,
    width: Math.min(screenWidth - 40, 400),
    maxWidth: "90%",
    ...SHADOWS.modal,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.modal.padding.horizontal,
    paddingVertical: SPACING.modal.padding.vertical,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.modal.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.modal.padding.horizontal,
    paddingVertical: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.modal.title,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.modal.text,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: SPACING.modal.padding.horizontal,
    paddingVertical: SPACING.modal.padding.vertical,
    borderTopWidth: 1,
    borderTopColor: COLORS.modal.border,
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.modal.buttonSecondary,
  },
  confirmButton: {
    backgroundColor: COLORS.modal.buttonPrimary,
  },
  buttonText: {
    ...TYPOGRAPHY.buttonText,
  },
  cancelButtonText: {
    color: COLORS.text,
  },
  confirmButtonText: {
    color: COLORS.text,
  },
});

// Alert utility functions
let alertRef: React.RefObject<typeof CustomAlert> | null = null;

export const setAlertRef = (ref: React.RefObject<typeof CustomAlert>) => {
  alertRef = ref;
};

export const showAlert = (
  title: string,
  message?: string,
  options?: {
    type?: "info" | "success" | "warning" | "error";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  },
) => {
  if (alertRef?.current) {
    // This would need to be implemented with state management
    // For now, we'll use the default Alert as fallback
    import("react-native").then(({ Alert }) => {
      const buttons = [];

      if (options?.cancelText) {
        buttons.push({
          text: options.cancelText,
          onPress: options.onCancel,
          style: "cancel" as const,
        });
      }

      buttons.push({
        text: options.confirmText || "OK",
        onPress: options.onConfirm,
      });

      Alert.alert(title, message, buttons);
    });
  }
};
