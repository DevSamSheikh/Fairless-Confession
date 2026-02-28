import { Audio } from 'expo-av';

type SoundType = 'like' | 'comment' | 'post' | 'notification' | 'error';

class SoundEffectsManager {
  private initialized = false;
  private enabled = true;

  async initialize() {
    if (this.initialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
      this.enabled = false;
    }
  }

  async play(type: SoundType) {
    if (!this.enabled) return;
    
    try {
      await this.initialize();
      
      let soundFile;
      switch (type) {
        case 'like':
          soundFile = require('../../assets/sounds/like.mp3');
          break;
        case 'comment':
          soundFile = require('../../assets/sounds/comment.mp3');
          break;
        case 'post':
          soundFile = require('../../assets/sounds/post.mp3');
          break;
        case 'notification':
          soundFile = require('../../assets/sounds/notification.mp3');
          break;
        case 'error':
          soundFile = require('../../assets/sounds/error.wav');
          break;
      }
      
      const { sound } = await Audio.Sound.createAsync(
        soundFile,
        { shouldPlay: true, volume: 0.7 },
        null,
        false
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn(`Failed to play ${type} sound:`, error);
    }
  }
}

export const soundEffects = new SoundEffectsManager();

// Pre-initialize audio to reduce delay
soundEffects.initialize();
