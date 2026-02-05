import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Image, StatusBar, TextInput, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PostCard } from '../components/PostCard';

const SOCIETY_CONFESSIONS = [
  {
    id: 's1',
    content: 'I joined this society just to see if anyone would recognize my stories.',
    category: 'Secrets' as any,
    reactions: { '❤️': 12, '😮': 2, '😢': 0, '😡': 0, '😂': 5 },
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    id: 's2',
    content: 'The hook text for this society is actually true, and that scares me.',
    category: 'Drama' as any,
    reactions: { '❤️': 5, '😮': 15, '😢': 1, '😡': 0, '😂': 2 },
    commentCount: 8,
    createdAt: new Date(Date.now() - 3600000),
  }
];

export const SocietyDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const society = route.params?.society || { name: 'Society', icon: 'people', members: 0 };
  
  const [isJoined, setIsJoined] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimer, setWarningTimer] = useState(6);
  const [confession, setConfession] = useState('');
  const [title, setTitle] = useState('');
  const [showPostBox, setShowPostBox] = useState(false);
  const [activeTab, setActiveTab] = useState("Latest");

  useEffect(() => {
    let interval: any;
    if (showWarning && warningTimer > 0) {
      interval = setInterval(() => {
        setWarningTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showWarning, warningTimer]);

  const handleJoin = () => {
    setShowWarning(true);
    setWarningTimer(6);
  };

  const confirmJoin = () => {
    setShowWarning(false);
    setIsJoined(true);
  };

  if (showWarning) {
    return (
      <View style={styles.warningContainer}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="warning" size={80} color={COLORS.error} />
        <Text style={styles.warningTitle}>OFFICIAL WARNING</Text>
        <Text style={styles.warningText}>
          By joining this society, you agree to maintain absolute anonymity and respect the privacy of others.{"\n\n"}
          Violating someone's privacy, harassment, or doxxing will result in an immediate and permanent ban.{"\n\n"}
          You are responsible for the content you share.
        </Text>
        
        <TouchableOpacity 
          style={[styles.acceptButton, warningTimer > 0 && styles.disabledButton]} 
          onPress={confirmJoin}
          disabled={warningTimer > 0}
        >
          <Text style={styles.acceptButtonText}>
            {warningTimer > 0 ? `Please read (${warningTimer}s)` : "I Accept & Join"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{society.name}</Text>
          {isJoined && (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>Member</Text>
            </View>
          )}
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={require("../../assets/images/logo.png")} 
            style={styles.heroBgOverlay}
            resizeMode="contain"
          />
          <View style={styles.heroOverlayContent}>
            <Text style={styles.hookText} numberOfLines={5}>
              Welcome to {society.name}. This is a safe space where the truth comes out. 
              No filters, no judgment, just raw confessions from people who understand.
              Join the inner circle today.
            </Text>
            
            <View style={styles.heroButtons}>
              {!isJoined ? (
                <TouchableOpacity style={styles.primaryHeroButton} onPress={handleJoin}>
                  <Text style={styles.heroButtonText}>Join Society</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.primaryHeroButton} onPress={() => setShowPostBox(!showPostBox)}>
                  <Text style={styles.heroButtonText}>{showPostBox ? "Cancel" : "Share Secret"}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.secondaryHeroButton}>
                <Text style={styles.heroButtonText}>Guidelines</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isJoined && (
          <View style={styles.societyTabs}>
            <TouchableOpacity 
              style={[styles.societyTab, activeTab === "Latest" && styles.activeSocietyTab]}
              onPress={() => setActiveTab("Latest")}
            >
              <Text style={[styles.societyTabText, activeTab === "Latest" && styles.activeSocietyTabText]}>Latest</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.societyTab, activeTab === "Trending" && styles.activeSocietyTab]}
              onPress={() => setActiveTab("Trending")}
            >
              <Text style={[styles.societyTabText, activeTab === "Trending" && styles.activeSocietyTabText]}>Trending</Text>
            </TouchableOpacity>
          </View>
        )}

        {isJoined ? (
          <View style={styles.unlockedContent}>
            {/* Confess Section */}
            {showPostBox && (
              <View style={styles.confessBox}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="Confession Title (optional)"
                  placeholderTextColor={COLORS.textSecondary}
                  maxLength={25}
                  value={title}
                  onChangeText={setTitle}
                />
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.confessInput}
                    placeholder="Share your secret with this society..."
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    value={confession}
                    onChangeText={setConfession}
                  />
                </View>
                <TouchableOpacity style={styles.confessButton} onPress={() => {
                  if (confession.trim()) {
                    setConfession('');
                    setTitle('');
                    setShowPostBox(false);
                    alert('Confession posted to society!');
                  }
                }}>
                  <Text style={styles.confessButtonText}>CONFESS</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Society Feed */}
            <Text style={styles.feedTitle}>Society Confessions</Text>
            {SOCIETY_CONFESSIONS.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post as any} 
                rank={activeTab === "Trending" ? index + 1 : undefined}
                onReact={() => {}} 
              />
            ))}
          </View>
        ) : (
          <View style={styles.lockedContainer}>
            <Ionicons name="lock-closed" size={40} color={COLORS.textSecondary} />
            <Text style={styles.lockedText}>Join this society to unlock confessions and post your own.</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(107, 92, 231, 0.3)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  memberBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  memberBadgeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    height: 250,
    backgroundColor: COLORS.cardBackground,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heroBgOverlay: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    opacity: 0.1,
    zIndex: 0,
  },
  heroOverlayContent: {
    zIndex: 1,
    width: '100%',
    alignItems: 'center',
  },
  hookText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryHeroButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  secondaryHeroButton: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroButtonText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  warningContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningTitle: {
    color: COLORS.error,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 20,
  },
  warningText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  lockedContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  unlockedContent: {
    padding: 20,
  },
  confessBox: {
    backgroundColor: 'transparent',
    marginBottom: 30,
  },
  titleInput: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    paddingVertical: 10,
    borderWidth: 0,
  },
  textAreaContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 15,
  },
  confessInput: {
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  confessButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confessButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  feedTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  societyTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    gap: 15,
  },
  societyTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  activeSocietyTab: {
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  societyTabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  activeSocietyTabText: {
    color: COLORS.accent,
  },
});
