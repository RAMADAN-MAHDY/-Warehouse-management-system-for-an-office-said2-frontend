import { useCallback, useEffect, useRef, useState } from 'react';
import { voiceService, type VoiceServiceError } from '@/services/voiceService';

export type TextToSpeechControls = {
  playingMessageId: string | null;
  loadingMessageId: string | null;
  error: VoiceServiceError | null;
  clearError: () => void;
  playSpeech: (messageId: string, text: string) => Promise<void>;
  stopSpeech: () => void;
  toggleSpeech: (messageId: string, text: string) => Promise<void>;
};

export function useTextToSpeech(): TextToSpeechControls {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<VoiceServiceError | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  const stopSpeech = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingMessageId(null);
  }, []);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const playSpeech = async (messageId: string, text: string) => {
    if (!text || !text.trim()) return;
    
    // Stop any existing playing audio
    stopSpeech();
    setError(null);

    const cacheKey = `${messageId}_${text.slice(0, 40)}`;

    try {
      let audioSrc = audioCacheRef.current.get(cacheKey);

      if (!audioSrc) {
        setLoadingMessageId(messageId);
        const res = await voiceService.synthesizeSpeech(text);

        if (res?.success && res.audio) {
          const mimeType = res.mimeType || 'audio/wav';
          audioSrc = `data:${mimeType};base64,${res.audio}`;
          audioCacheRef.current.set(cacheKey, audioSrc);
        } else {
          throw { message: 'فشل في توليد الصوت' };
        }
      }

      setLoadingMessageId(null);

      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingMessageId(null);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('Audio playback error', e);
        setError({ message: 'حدث خطأ أثناء تشغيل الملف الصوتي' });
        setPlayingMessageId(null);
        audioRef.current = null;
      };

      await audio.play();
      setPlayingMessageId(messageId);
    } catch (err: unknown) {
      console.error('TTS error:', err);
      setLoadingMessageId(null);
      setPlayingMessageId(null);

      const serviceErr = err as VoiceServiceError;
      setError({
        message: serviceErr.message || 'فشل في تحويل النص إلى صوت',
        code: serviceErr.code,
        retryAfterSeconds: serviceErr.retryAfterSeconds,
      });
    }
  };

  const toggleSpeech = async (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      stopSpeech();
    } else {
      await playSpeech(messageId, text);
    }
  };

  return {
    playingMessageId,
    loadingMessageId,
    error,
    clearError,
    playSpeech,
    stopSpeech,
    toggleSpeech,
  };
}
