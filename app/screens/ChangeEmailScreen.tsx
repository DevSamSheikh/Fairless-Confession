import React, { useState, useEffect } from "react";
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

export const ChangeEmailScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, setUser } = useUserStore();
  const [currentEmail, setCurrentEmail] = useState(user?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentEmail) newErrors.currentEmail = "Current email is required";
    if (!newEmail) newErrors.newEmail = "New email is required";
    if (!validateEmail(currentEmail))
      newErrors.currentEmail = "Invalid current email format";
    if (!validateEmail(newEmail))
      newErrors.newEmail = "Invalid new email format";
    if (!confirmEmail) newErrors.confirmEmail = "Please confirm new email";
    if (newEmail !== confirmEmail)
      newErrors.confirmEmail = "Emails do not match";
    if (currentEmail === newEmail)
      newErrors.newEmail = "New email must be different from current email";
    if (!password)
      newErrors.password = "Password is required for authentication";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    setCurrentEmail(user?.email || "");
  }, [user]);

  const handleUpdateEmail = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // Call the backend API to change email
      const response = await apiFetch("/api/auth/change-email", {
        method: "POST",
        body: JSON.stringify({
          currentEmail,
          newEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || "Failed to change email");
      }

      Toast.show({
        type: "success",
        text1: "Email Change Initiated",
        text2: `Verification email sent to ${newEmail}. Please check your inbox and follow the link to confirm.`,
      });

      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error: any) {
      console.error("Email change error:", error);
      Toast.show({
        type: "error",
        text1: "Email Change Failed",
        text2:
          error.message ||
          "An error occurred while changing your email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Email</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={COLORS.accent}
          />
          <Text style={styles.infoText}>
            You'll need to confirm your new email address. A verification link
            will be sent to your new email.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Email Address</Text>
            <TextInput
              style={[styles.input, errors.currentEmail && styles.inputError]}
              value={currentEmail}
              onChangeText={setCurrentEmail}
              placeholder="Enter your current email"
              placeholderTextColor="#8E9196"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false} // Current email should not be editable
            />
            {errors.currentEmail && (
              <Text style={styles.errorText}>{errors.currentEmail}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Email Address</Text>
            <TextInput
              style={[styles.input, errors.newEmail && styles.inputError]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter your new email"
              placeholderTextColor="#8E9196"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.newEmail && (
              <Text style={styles.errorText}>{errors.newEmail}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Email</Text>
            <TextInput
              style={[styles.input, errors.confirmEmail && styles.inputError]}
              value={confirmEmail}
              onChangeText={setConfirmEmail}
              placeholder="Confirm your new email"
              placeholderTextColor="#8E9196"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.confirmEmail && (
              <Text style={styles.errorText}>{errors.confirmEmail}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password && styles.inputError,
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#8E9196"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#8E9196"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.disabledButton]}
            onPress={handleUpdateEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.updateButtonText}>Update Email</Text>
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
