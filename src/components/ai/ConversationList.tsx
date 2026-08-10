'use client';

import React, { useEffect, useState } from 'react';
import { aiService } from '@/services/aiService';
import ChatSidebar from './ChatSidebar';

type Conversation = {
  _id: string;
  title: string;
  summary?: string;
  lastActivityAt?: string;
  messageCount?: number;
};

export default function ConversationList({
  selectedId,
  onSelect,
  reloadTrigger,
  onClose,
}: {
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
  reloadTrigger?: number;
  onClose?: () => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.listConversations();
      if (res?.success) setConversations(res.data.conversations || []);
      else setError('فشل جلب المحادثات');
    } catch (err: unknown) {
      console.error('Failed to load conversations', err);
      const backendMessage = err instanceof Error ? err.message : '';
      setError(backendMessage || 'فشل جلب المحادثات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof reloadTrigger !== 'undefined') {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTrigger]);

  return (
    <div className="h-full w-full">
      <ChatSidebar
        conversations={conversations}
        selectedId={selectedId}
        loading={loading}
        error={error}
        onSelect={onSelect}
        onCreateNew={() => onSelect(null)}
        onRetry={() => void load()}
        onClose={onClose}
      />
    </div>
  );
}
