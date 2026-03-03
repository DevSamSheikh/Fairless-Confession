// Report Modal Component - Allow users to report inappropriate content
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { ReportReason, REPORT_REASONS, reportContent } from '../api/reports';
import { showErrorToast, showSuccessToast } from '../utils/toast';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
  postContent?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  postId,
  postTitle,
  postContent,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      showErrorToast('Please select a reason for reporting');
      return;
    }

    setIsSubmitting(true);

    try {
      await reportContent({
        postId,
        reason: selectedReason,
        description: description.trim() || undefined,
      });

      showSuccessToast('Content reported successfully');
      handleClose();
    } catch (error) {
      console.error('Report submission error:', error);
      showErrorToast('Failed to report content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDescription('');
    onClose();
  };

  const showConfirmationAlert = () => {
    Alert.alert(
      'Report Content',
      'Are you sure you want to report this content? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: handleSubmit,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Report Content</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Preview */}
          <View style={styles.postPreview}>
            <Text style={styles.previewLabel}>Content being reported:</Text>
            <View style={styles.previewContent}>
              {postTitle && (
                <Text style={styles.previewTitle}>{postTitle}</Text>
              )}
              <Text style={styles.previewText}>
                {postContent?.substring(0, 200)}
                {postContent && postContent.length > 200 && '...'}
              </Text>
            </View>
          </View>

          {/* Report Reasons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for reporting</Text>
            <Text style={styles.sectionSubtitle}>
              Please select the most appropriate reason
            </Text>

            {REPORT_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <View style={styles.radioButton}>
                  <View
                    style={[
                      styles.radioInner,
                      selectedReason === reason && styles.radioInnerSelected,
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Additional Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional details (optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Provide any additional context that might help us review this content
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Add any additional information..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              maxLength={500}
            />
            <Text style={styles.characterCount}>
              {description.length}/500
            </Text>
          </View>

          {/* Warning Text */}
          <View style={styles.warningSection}>
            <Ionicons name="warning" size={20} color={COLORS.error} />
            <Text style={styles.warningText}>
              False reports may result in action against your account. Please report
              content that violates our community guidelines.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={showConfirmationAlert}
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Report Content</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  postPreview: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  previewContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reasonOptionSelected: {
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radioInnerSelected: {
    backgroundColor: COLORS.accent,
  },
  reasonText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  reasonTextSelected: {
    color: COLORS.accent,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
  },
  warningText: {
    fontSize: 13,
    color: COLORS.error,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
    fontWeight: '500',
  },
});
