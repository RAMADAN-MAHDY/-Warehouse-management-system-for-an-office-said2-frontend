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

function pcmBase64ToWavBlobUrl(base64Audio: string, sampleRate = 24000): string {
  try {
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const pcmBytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      pcmBytes[i] = binaryString.charCodeAt(i);
    }

    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmBytes.length;
    const chunkSize = 36 + dataSize;

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, chunkSize, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"

    // fmt subchunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);

    // data subchunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true);

    const wavBytes = new Uint8Array(44 + dataSize);
    wavBytes.set(new Uint8Array(wavHeader), 0);
    wavBytes.set(pcmBytes, 44);

    const blob = new Blob([wavBytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Failed to convert PCM to WAV:', e);
    return `data:audio/wav;base64,${base64Audio}`;
  }
}

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
          const rawMime = res.mimeType || 'audio/wav';
          if (rawMime.includes('pcm')) {
            const rateMatch = rawMime.match(/rate=(\d+)/);
            const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
            audioSrc = pcmBase64ToWavBlobUrl(res.audio, sampleRate);
          } else {
            audioSrc = `data:${rawMime};base64,${res.audio}`;
          }
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
