import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { apiFetch } from "../api/client";
import { useUserStore } from "../store/user.store";

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUserStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "", color: "#8E9196" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthLevels = [
      { strength: 0, text: "Very Weak", color: "#FF4B4B" },
      { strength: 1, text: "Weak", color: "#FF8C42" },
      { strength: 2, text: "Fair", color: "#FFD93D" },
      { strength: 3, text: "Good", color: "#6BCF7F" },
      { strength: 4, text: "Strong", color: "#4CAF50" },
      { strength: 5, text: "Very Strong", color: "#2E7D32" },
    ];

    return strengthLevels[Math.min(strength, 4)];
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (!validatePassword(newPassword))
      newErrors.newPassword = "Password must be at least 8 characters long";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your new password";
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (currentPassword === newPassword)
      newErrors.newPassword =
        "New password must be different from current password";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // Call the backend API to change password
      const response = await apiFetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to change password");
      }

      Toast.show({
        type: "success",
        text1: "Password Updated Successfully",
        text2: "Your password has been changed successfully.",
      });

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error("Password change error:", error);
      Toast.show({
        type: "error",
        text1: "Password Change Failed",
        text2:
          error.message ||
          "An error occurred while changing your password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={24}
            color={COLORS.accent}
          />
          <Text style={styles.infoText}>
            Choose a strong password that you haven't used before. Use a mix of
            letters, numbers, and symbols.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.currentPassword && styles.inputError,
                ]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter your current password"
                placeholderTextColor="#8E9196"
                secureTextEntry={!showCurrentPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#8E9196"
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.newPassword && styles.inputError,
                ]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                placeholderTextColor="#8E9196"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#8E9196"
                />
              </TouchableOpacity>
            </View>
            {newPassword && (
              <View style={styles.strengthIndicator}>
                <Text style={styles.strengthLabel}>Password Strength:</Text>
                <Text
                  style={[
                    styles.strengthText,
                    { color: passwordStrength.color },
                  ]}
                >
                  {passwordStrength.text}
                </Text>
              </View>
            )}
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword && styles.inputError,
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your new password"
                placeholderTextColor="#8E9196"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#8E9196"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: "rgba(107, 92, 231, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(107, 92, 231, 0.3)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#FFFFFF",
    marginBottom: 8,
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 15,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#FF4B4B",
    borderWidth: 2,
  },
  errorText: {
    color: "#FF4B4B",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  strengthIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  strengthLabel: {
    color: "#8E9196",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  strengthText: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  updateButton: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
});
