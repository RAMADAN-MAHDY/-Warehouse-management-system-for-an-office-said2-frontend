import axios, { type AxiosRequestHeaders } from 'axios';

export type VoiceApiErrorPayload = {
  code: string;
  message: string;
  retryAfterSeconds?: number;
};

export type TranscribeResponse = {
  success: true;
  text: string;
};

export type SynthesizeResponse = {
  success: true;
  audio: string; // Base64 string
  mimeType: string;
  cached?: boolean;
};

export type VoiceServiceError = {
  message: string;
  code?: string;
  retryAfterSeconds?: number;
};

const AI_BASE_URL =
  process.env.NEXT_PUBLIC_AI_URL ||
  process.env.NEXT_PUBLIC_AI_API_URL ||
  'https://makhzangy-ai.vercel.app';

function createVoiceClient() {
  const client = axios.create({
    baseURL: AI_BASE_URL,
    withCredentials: false,
  });

  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        const headers = (config.headers as AxiosRequestHeaders) || {};
        headers.Authorization = `Bearer ${token}`;
        config.headers = headers;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const resData = error.response?.data;
      
      const errorObj: VoiceServiceError = {
        message: 'حدث خطأ في الخدمة الصوتية',
      };

      if (resData?.error && typeof resData.error === 'object') {
        errorObj.message = resData.error.message || errorObj.message;
        errorObj.code = resData.error.code;
        if (typeof resData.error.retryAfterSeconds === 'number') {
          errorObj.retryAfterSeconds = resData.error.retryAfterSeconds;
        }
      } else if (typeof resData?.message === 'string') {
        errorObj.message = resData.message;
      } else if (typeof resData?.error === 'string') {
        errorObj.message = resData.error;
      }

      return Promise.reject(errorObj);
    }
  );

  return client;
}

export const voiceService = {
  /**
   * Transcribe recorded audio blob to text (STT)
   * Endpoint: POST /api/voice/transcribe
   */
  transcribeAudio: async (audioBlob: Blob, filename = 'recording.webm'): Promise<TranscribeResponse> => {
    const client = createVoiceClient();
    const formData = new FormData();
    formData.append('audio', audioBlob, filename);

    const res = await client.post<TranscribeResponse>('/api/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },

  /**
   * Synthesize text message into spoken audio (TTS)
   * Endpoint: POST /api/voice/synthesize
   */
  synthesizeSpeech: async (text: string): Promise<SynthesizeResponse> => {
    const client = createVoiceClient();
    const res = await client.post<SynthesizeResponse>('/api/voice/synthesize', { text });
    return res.data;
  },
};
