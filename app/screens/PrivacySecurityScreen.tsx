import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";
import { useNavigation } from "@react-navigation/native";

export const PrivacySecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [dataCollectionEnabled, setDataCollectionEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  const handleNavigateToChangeEmail = () => {
    navigation.navigate("ChangeEmail" as never);
  };

  const handleNavigateToChangePassword = () => {
    navigation.navigate("ChangePassword" as never);
  };

  const handleTwoFactorToggle = () => {
    if (!twoFactorEnabled) {
      Alert.alert(
        "Enable Two-Factor Authentication",
        "This will add an extra layer of security to your account. You'll need to enter a code from your authenticator app when signing in.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Enable", onPress: () => setTwoFactorEnabled(true) },
        ],
      );
    } else {
      setTwoFactorEnabled(false);
    }
  };

  const handleBiometricToggle = () => {
    setBiometricEnabled(!biometricEnabled);
  };

  const handleDataCollectionToggle = () => {
    Alert.alert(
      "Data Collection",
      "Disabling data collection may affect some app features. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Disable", onPress: () => setDataCollectionEnabled(false) },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleNavigateToChangeEmail}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(107, 92, 231, 0.2)" },
                ]}
              >
                <Ionicons name="mail" size={20} color={COLORS.accent} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Change Email</Text>
                <Text style={styles.menuItemSubtitle}>
                  Update your email address
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E9196" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleNavigateToChangePassword}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(255, 75, 75, 0.2)" },
                ]}
              >
                <Ionicons name="lock-closed" size={20} color="#FF4B4B" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Change Password</Text>
                <Text style={styles.menuItemSubtitle}>
                  Update your password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E9196" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTwoFactorToggle}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(76, 175, 80, 0.2)" },
                ]}
              >
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>
                  Two-Factor Authentication
                </Text>
                <Text style={styles.menuItemSubtitle}>
                  {twoFactorEnabled
                    ? "Enabled"
                    : "Add an extra layer of security"}
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleTwoFactorToggle}
              trackColor={{ false: "#3A3F4B", true: "rgba(76, 175, 80, 0.3)" }}
              thumbColor={twoFactorEnabled ? "#4CAF50" : "#8E9196"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleBiometricToggle}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(255, 193, 7, 0.2)" },
                ]}
              >
                <Ionicons name="finger-print" size={20} color="#FFC107" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Biometric Login</Text>
                <Text style={styles.menuItemSubtitle}>
                  {biometricEnabled
                    ? "Use fingerprint or face ID"
                    : "Enable biometric authentication"}
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: "#3A3F4B", true: "rgba(255, 193, 7, 0.3)" }}
              thumbColor={biometricEnabled ? "#FFC107" : "#8E9196"}
            />
          </TouchableOpacity>
        </View>

        {/* Privacy Options Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Options</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(156, 39, 176, 0.2)" },
                ]}
              >
                <Ionicons name="eye-off" size={20} color="#9C27B0" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Private Profile</Text>
                <Text style={styles.menuItemSubtitle}>
                  Only approved followers can see your posts
                </Text>
              </View>
            </View>
            <Switch
              value={false}
              trackColor={{ false: "#3A3F4B", true: "rgba(156, 39, 176, 0.3)" }}
              thumbColor={COLORS.accent}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDataCollectionToggle}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(3, 169, 244, 0.2)" },
                ]}
              >
                <Ionicons name="analytics" size={20} color="#03A9F4" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Data Collection</Text>
                <Text style={styles.menuItemSubtitle}>
                  {dataCollectionEnabled
                    ? "Help improve the app"
                    : "Data collection disabled"}
                </Text>
              </View>
            </View>
            <Switch
              value={dataCollectionEnabled}
              onValueChange={handleDataCollectionToggle}
              trackColor={{ false: "#3A3F4B", true: "rgba(3, 169, 244, 0.3)" }}
              thumbColor={dataCollectionEnabled ? "#03A9F4" : "#8E9196"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(255, 152, 0, 0.2)" },
                ]}
              >
                <Ionicons name="location" size={20} color="#FF9800" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Location Services</Text>
                <Text style={styles.menuItemSubtitle}>
                  Allow app to access your location
                </Text>
              </View>
            </View>
            <Switch
              value={false}
              trackColor={{ false: "#3A3F4B", true: "rgba(255, 152, 0, 0.3)" }}
              thumbColor={COLORS.accent}
            />
          </TouchableOpacity>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(244, 67, 54, 0.2)" },
                ]}
              >
                <Ionicons name="download" size={20} color="#F44336" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Download My Data</Text>
                <Text style={styles.menuItemSubtitle}>
                  Get a copy of your information
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E9196" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(233, 30, 99, 0.2)" },
                ]}
              >
                <Ionicons name="trash" size={20} color="#E91E63" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Clear Cache</Text>
                <Text style={styles.menuItemSubtitle}>
                  Free up storage space
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E9196" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(139, 195, 74, 0.2)" },
                ]}
              >
                <Ionicons name="document-text" size={20} color="#8BC34A" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Privacy Policy</Text>
                <Text style={styles.menuItemSubtitle}>
                  Learn how we protect your data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8E9196" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
    fontFamily: "Poppins_700Bold",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
});
