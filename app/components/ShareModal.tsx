import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useSharePost, type PostShareData } from '../hooks/useSharePost';

const { width } = Dimensions.get('window');

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  post: PostShareData;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  post,
}) => {
  const {
    sharePost,
    shareToFacebook,
    shareToInstagram,
    shareToWhatsApp,
    shareGeneric,
    isSharing,
  } = useSharePost();

  const PROMO_BANNER_IMAGE = 'https://via.placeholder.com/150x150.png'; // Replace with your actual banner URL

  const handleShare = async (platform: 'facebook' | 'instagram' | 'whatsapp' | 'generic') => {
    await sharePost(post, platform);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Share Confession</Text>
          </View>

          {/* Promo Banner */}
          <View style={styles.bannerContainer}>
            <Image
              source={{ uri: PROMO_BANNER_IMAGE }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerText}>
                📱 Download our app for more features!
              </Text>
            </View>
          </View>

          {/* Post Preview */}
          <View style={styles.postPreview}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postBody} numberOfLines={3}>
              {post.body}
            </Text>
          </View>

          {/* Share Options */}
          <View style={styles.shareOptions}>
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#1877F2' }]}
              onPress={() => handleShare('facebook')}
              disabled={isSharing}
            >
              <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#E4405F' }]}
              onPress={() => handleShare('instagram')}
              disabled={isSharing}
            >
              <Ionicons name="logo-instagram" size={24} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: '#25D366' }]}
              onPress={() => handleShare('whatsapp')}
              disabled={isSharing}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: COLORS.accent }]}
              onPress={() => handleShare('generic')}
              disabled={isSharing}
            >
              <Ionicons name="share-social" size={24} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>More</Text>
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {isSharing && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Sharing...</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1E222B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
  },
  bannerContainer: {
    position: 'relative',
    height: 120,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  postPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
  },
  postTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    marginBottom: 8,
  },
  postBody: {
    color: '#E1E1E1',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
  shareOptions: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 56,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    fontWeight: '500',
  },
});
