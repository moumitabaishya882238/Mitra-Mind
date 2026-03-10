// @ts-ignore - Community voice package doesn't have full type definitions
import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

/**
 * VoiceService: Handles speech-to-text (STT) and text-to-speech (TTS) operations
 */

export type VoiceServiceConfig = {
  language?: string;
  androidPrompt?: string;
};

const DEFAULT_CONFIG: VoiceServiceConfig = {
  language: 'en-US',
  androidPrompt: 'Listening... Speak now',
};

class VoiceServiceClass {
  private config: VoiceServiceConfig;
  private isListening = false;
  private isSpeaking = false;

  constructor(config?: VoiceServiceConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeTts();
  }

  /**
   * Initialize Text-to-Speech engine
   */
  private initializeTts() {
    try {
      Tts.setDefaultLanguage('en-US');
      Tts.setDefaultRate(0.475); // Much slower for comfort
      Tts.setDefaultPitch(1.0);
    } catch (error) {
      console.warn('TTS initialization warning:', error);
    }
  }

  /**
   * Start listening for speech input
   * @returns Promise with recognized text
   */
  async startListening(): Promise<string> {
    if (this.isListening) {
      console.warn('Already listening');
      return '';
    }

    return new Promise(async (resolve, reject) => {
      try {
        this.isListening = true;

        Voice.onSpeechResults = (event: any) => {
          if (event.value && event.value.length > 0) {
            const recognized = event.value[0]; // Best match
            resolve(recognized);
            this.isListening = false;
          }
        };

        Voice.onSpeechError = (event: any) => {
          console.warn('Speech error:', event.error);
          this.isListening = false;
          reject(new Error(`Speech error: ${event.error}`));
        };

        Voice.onSpeechStart = () => {
          console.log('Speech listening started');
        };

        Voice.onSpeechEnd = () => {
          console.log('Speech listening ended');
          if (this.isListening) {
            this.isListening = false;
          }
        };

        // Start recognition
        await Voice.start(this.config.language, {
          androidPrompt: this.config.androidPrompt,
        });
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  /**
   * Stop listening for speech
   */
  async stopListening(): Promise<void> {
    try {
      if (this.isListening) {
        await Voice.stop();
        this.isListening = false;
      }
    } catch (error) {
      console.warn('Error stopping voice recognition:', error);
    }
  }

  /**
   * Cancel speech recognition
   */
  async cancelListening(): Promise<void> {
    try {
      await Voice.cancel();
      this.isListening = false;
    } catch (error) {
      console.warn('Error canceling voice recognition:', error);
    }
  }

  /**
   * Speak text aloud
   * @param text Text to speak
   * @param language Optional language code (e.g. 'hi', 'as')
   */
  async speak(text: string, language: string = 'en'): Promise<void> {
    if (!text.trim()) {
      return;
    }

    // Map short codes to TTS locale codes
    let ttsLanguage = 'en-US';
    if (language.startsWith('hi')) ttsLanguage = 'hi-IN';
    if (language.startsWith('as')) ttsLanguage = 'as-IN';
    // Add more mappings if needed

    try {
      Tts.setDefaultLanguage(ttsLanguage);
    } catch (e) {
      console.warn(`Could not set TTS language to ${ttsLanguage}:`, e);
    }

    return new Promise((resolve, reject) => {
      try {
        this.isSpeaking = true;

        let settled = false;
        const estimatedMs = Math.max(1800, Math.min(text.trim().split(/\s+/).length * 520, 14000));
        let finishSub: any;
        let cancelSub: any;
        let errorSub: any;
        const cleanupSubs = () => {
          finishSub?.remove?.();
          cancelSub?.remove?.();
          errorSub?.remove?.();
        };

        finishSub = Tts.addEventListener('tts-finish', () => {
          if (settled) return;
          settled = true;
          this.isSpeaking = false;
          cleanupSubs();
          resolve();
        });

        cancelSub = Tts.addEventListener('tts-cancel', () => {
          if (settled) return;
          settled = true;
          this.isSpeaking = false;
          cleanupSubs();
          reject(new Error('TTS canceled'));
        });

        errorSub = Tts.addEventListener('tts-error', (event: any) => {
          if (settled) return;
          settled = true;
          this.isSpeaking = false;
          cleanupSubs();
          reject(new Error(event?.message || 'TTS playback failed'));
        });

        // Define specific voice parameters per language for Android
        let androidParams: any = {
          KEY_PARAM_PAN: 0,
          KEY_PARAM_VOLUME: 0.8,
          KEY_PARAM_STREAM: 'STREAM_MUSIC',
        };

        // Enforce female Indian voices
        if (ttsLanguage === 'hi-IN') {
          androidParams = {
            ...androidParams,
            // Try to force the high-quality Google Hindi Female network voice
            name: 'hi-in-x-hie-network',
            language: 'hi-IN'
          };
        } else if (ttsLanguage === 'as-IN') {
          // Native Assamese TTS is very rare on Android devices.
          // Bengali (bn-IN) reading Assamese script sounds 95% identical and is the standard fallback
          // to prevent the robot-English accent.
          Tts.setDefaultLanguage('bn-IN'); // Override for Assamese
          androidParams = {
            ...androidParams,
            name: 'bn-in-x-bnd-network', // Indian Bengali Female
            language: 'bn-IN'
          };
        }

        // Start speaking. Completion is tracked by finish/cancel/error events above.
        // We drop iosVoiceId here so iOS uses the default system voice for the selected language
        Tts.speak(text, {
          rate: 0.45,
          androidParams,
        } as any);

        // Fallback: in case finish events are not fired on some devices.
        setTimeout(() => {
          if (settled) return;
          settled = true;
          this.isSpeaking = false;
          cleanupSubs();
          resolve();
        }, estimatedMs);
      } catch (error) {
        this.isSpeaking = false;
        reject(error);
      }
    });
  }

  /**
   * Stop speaking
   */
  async stopSpeaking(): Promise<void> {
    try {
      await Tts.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.warn('Error stopping TTS:', error);
    }
  }

  /**
   * Get listening state
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get speaking state
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Cleanup and destroy voice listeners
   */
  async destroy(): Promise<void> {
    try {
      await this.stopListening();
      await this.stopSpeaking();
      Voice.destroy();
    } catch (error) {
      console.warn('Error destroying voice service:', error);
    }
  }
}

// Export singleton instance
export default new VoiceServiceClass();
