import { useCallback, useEffect, useRef, useState } from 'react';

export type AudioRecorderState = {
  isRecording: boolean;
  recordingTime: number; // Duration in seconds
  audioLevels: number[]; // Normalized 0-1 values for visualizer waveform
  permissionError: string | null;
};

export type AudioRecorderControls = AudioRecorderState & {
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
};

function getSupportedMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) return 'audio/webm';
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav',
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

export function useAudioRecorder(): AudioRecorderControls {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>([0.2, 0.4, 0.6, 0.4, 0.2]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Clean up timer & audio nodes
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const updateVisualizer = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Pick 6 sample bars
    const barCount = 6;
    const step = Math.floor(dataArray.length / barCount);
    const levels: number[] = [];

    for (let i = 0; i < barCount; i++) {
      const sample = dataArray[i * step] || 0;
      // Normalize to 0.15 - 1.0
      const normalized = Math.max(0.15, Math.min(1.0, sample / 255));
      levels.push(normalized);
    }

    setAudioLevels(levels);
    animFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  const startRecording = async (): Promise<boolean> => {
    setPermissionError(null);
    cleanup();

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setPermissionError('المتصفح الحالي لا يدعم تسجيل الصوت');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // AudioContext for visualizer
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        updateVisualizer();
      } catch (err) {
        console.warn('AudioContext visualizer not supported', err);
      }

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // collect 100ms chunks
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      return true;
    } catch (err: unknown) {
      console.error('Error starting audio recording:', err);
      let message = 'تعذر الوصول إلى الميكروفون. يرجى التحقق من إعدادات المتصفح.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'تم رفض الإذن لاستخدام الميكروفون. يرجى السماح بالوصول وتجربة ذلك مجدداً.';
        } else if (err.name === 'NotFoundError') {
          message = 'لم يتم العثور على ميكروفون متصل بجهازك.';
        }
      }
      setPermissionError(message);
      cleanup();
      return false;
    }
  };

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        cleanup();
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        cleanup();
        setIsRecording(false);
        resolve(audioBlob.size > 0 ? audioBlob : null);
      };

      try {
        recorder.stop();
      } catch (err) {
        console.error('Error stopping MediaRecorder:', err);
        cleanup();
        setIsRecording(false);
        resolve(null);
      }
    });
  };

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        // ignore
      }
    }
    cleanup();
    setIsRecording(false);
    setRecordingTime(0);
  }, [cleanup]);

  return {
    isRecording,
    recordingTime,
    audioLevels,
    permissionError,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
