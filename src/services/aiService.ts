import axios, { type AxiosRequestHeaders } from 'axios';

type SendMessageResp = {
  success: boolean;
  data: {
    conversationId: string;
    reply: string;
    toolCalls?: Array<{ name: string }>;
  };
};

const AI_BASE_URL =
  process.env.NEXT_PUBLIC_AI_URL ||
  process.env.NEXT_PUBLIC_AI_API_URL ||
  'https://makhzangy-ai.vercel.app';

function createAIClient() {
  const client = axios.create({
    baseURL: AI_BASE_URL,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
    },
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

  return client;
}

export const aiService = {
  sendMessage: async (payload: { conversationId?: string; message: string }) => {
    const client = createAIClient();
    const res = await client.post<SendMessageResp>('/api/ai/chat', payload);
    return res.data;
  },

  listConversations: async () => {
    const client = createAIClient();
    const res = await client.get('/api/ai/conversations');
    return res.data;
  },

  getConversationMessages: async (conversationId: string) => {
    const client = createAIClient();
    const res = await client.get(`/api/ai/conversations/${conversationId}/messages`);
    return res.data;
  },

  // Superadmin-only usage endpoint (optional)
  getUsage: async (params?: { from?: string; to?: string }) => {
    const client = createAIClient();
    const res = await client.get('/api/ai/usage', { params });
    return res.data;
  },
};
