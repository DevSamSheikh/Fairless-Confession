import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { createSociety } from '../api/societies';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const ICONS = ['people', 'school', 'heart', 'briefcase', 'moon', 'star', 'flash', 'planet'];

export const CreateSocietyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [intro, setIntro] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('people');
  const [loading, setLoading] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = async () => {
    if (name.length > 25) return showErrorToast('Name too long (max 25 characters)');
    if (subtitle.length > 30) return showErrorToast('Subtitle too long (max 30 characters)');
    if (intro.length < 100 || intro.length > 200) {
      return showErrorToast('Intro must be between 100 and 200 characters');
    }
    
    setLoading(true);
    try {
      const societyData = {
        name: name.trim(),
        description: intro.trim(),
        isPrivate,
        iconName: selectedIcon,
      };
      
      const newSociety = await createSociety(societyData);
      showSuccessToast('Society created successfully!');
      
      // Navigate to the newly created society
      (navigation as any).navigate('SocietyDetail', { society: newSociety });
    } catch (error: any) {
      console.error('Failed to create society:', error);
      const errorMessage = error?.message || 'Failed to create society. Please try again.';
      if (errorMessage.includes('already exists')) {
        showErrorToast('A society with this name already exists');
      } else {
        showErrorToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Society</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.label}>Society Name (Max 25)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Secret Garden"
              placeholderTextColor="#8E9196"
              maxLength={25}
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.charCount}>{name.length}/25</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Select Icon</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.selectedIcon,
                  ]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Ionicons 
                    name={icon as any} 
                    size={24} 
                    color={selectedIcon === icon ? COLORS.accent : '#FFFFFF'} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Subtitle (Max 30)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Where secrets bloom"
              placeholderTextColor="#8E9196"
              maxLength={30}
              value={subtitle}
              onChangeText={setSubtitle}
            />
            <Text style={styles.charCount}>{subtitle.length}/30</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Hero Intro (100 - 200 characters)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the soul of your society..."
              placeholderTextColor="#8E9196"
              multiline
              numberOfLines={4}
              value={intro}
              onChangeText={setIntro}
            />
            <Text style={[
              styles.charCount, 
              (intro.length > 0 && (intro.length < 100 || intro.length > 200)) && { color: COLORS.error }
            ]}>
              {intro.length}/200 (Min 100)
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.privacyHeader}>
              <Text style={styles.label}>Privacy Settings</Text>
              <TouchableOpacity 
                style={[styles.toggle, isPrivate && styles.toggleActive]}
                onPress={() => setIsPrivate(!isPrivate)}
              >
                <View style={[styles.toggleCircle, isPrivate && styles.toggleCircleActive]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.privacyDescription}>
              {isPrivate ? '🔒 Private society - Only invited members can join' : '🌍 Public society - Anyone can discover and join'}
            </Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.createButton,
              (!name || !subtitle || intro.length < 100 || intro.length > 200 || loading) && styles.disabledButton
            ]} 
            onPress={handleCreate}
            disabled={!name || !subtitle || intro.length < 100 || intro.length > 200 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Launch Society</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontFamily: 'Poppins_500Medium',
  },
  input: {
    backgroundColor: '#1E222B',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E222B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedIcon: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
  },
  createButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: COLORS.border,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E222B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  toggleCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8E9196',
  },
  toggleCircleActive: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  privacyDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
