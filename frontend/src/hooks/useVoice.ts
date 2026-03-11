import { useState, useCallback, useEffect } from 'react';
import voiceService from '../services/voiceService';

export type VoiceInputState = 'idle' | 'listening' | 'processing' | 'error';

/**
 * useVoiceInput: Hook for speech-to-text functionality
 * Returns state management for capturing voice input
 */
export function useVoiceInput() {
  const [state, setState] = useState<VoiceInputState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      setState('listening');
      const result = await voiceService.startListening();
      if (result) {
        setTranscript(result);
        setState('processing');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to capture voice';
      setError(errorMsg);
      setState('error');
      console.error('Voice input error:', err);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await voiceService.stopListening();
      setState('idle');
    } catch (err) {
      console.error('Error stopping voice:', err);
    }
  }, []);

  const cancelListening = useCallback(async () => {
    try {
      await voiceService.cancelListening();
      setState('idle');
      setTranscript('');
      setError(null);
    } catch (err) {
      console.error('Error canceling voice:', err);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setState('idle');
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      voiceService.destroy().catch(console.warn);
    };
  }, []);

  return {
    state,
    transcript,
    error,
    isListening: voiceService.getIsListening(),
    startListening,
    stopListening,
    cancelListening,
    clearTranscript,
    resetError,
  };
}

export type VoiceOutputState = 'idle' | 'speaking' | 'error';

/**
 * useVoiceOutput: Hook for text-to-speech functionality
 * Returns state management for speaking text
 */
export function useVoiceOutput() {
  const [state, setState] = useState<VoiceOutputState>('idle');
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (text: string, language: string = 'en') => {
    try {
      setError(null);
      setState('speaking');
      await voiceService.speak(text, language);
      setState('idle');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to speak text';
      setError(errorMsg);
      setState('error');
      console.error('Voice output error:', err);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await voiceService.stopSpeaking();
      setState('idle');
    } catch (err) {
      console.error('Error stopping speech:', err);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      voiceService.destroy().catch(console.warn);
    };
  }, []);

  return {
    state,
    error,
    isSpeaking: voiceService.getIsSpeaking(),
    speak,
    stop,
    resetError,
  };
}
