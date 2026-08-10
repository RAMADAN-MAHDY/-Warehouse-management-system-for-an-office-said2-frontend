'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AudioPlayerButton from './AudioPlayerButton';

export type Message = {
  id?: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  createdAt?: string;
};

type MessageBubbleProps = {
  message: Message;
  messageIndex: number;
  playingMessageId?: string | null;
  loadingMessageId?: string | null;
  onToggleAudio?: (messageId: string, text: string) => void;
};

function formatTime(value?: string) {
  if (!value) return '';

  try {
    return new Date(value).toLocaleTimeString('ar-EG', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function MessageBubble({
  message,
  messageIndex,
  playingMessageId,
  loadingMessageId,
  onToggleAudio,
}: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';
  const msgId = message.id || `msg_${messageIndex}_${message.createdAt || ''}`;
  const isPlaying = playingMessageId === msgId;
  const isLoading = loadingMessageId === msgId;

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[95%] rounded-2xl border px-4 py-3 shadow-[0_10px_30px_-20px_rgba(2,6,23,0.95)] transition ${
          isAssistant
            ? 'border-slate-700/80 bg-slate-800/90 text-slate-100'
            : 'border-emerald-600/30 bg-emerald-600 text-white'
        }`}
      >
        <div className={`ai-markdown max-w-none break-words text-sm ${isAssistant ? 'text-slate-100' : 'text-white'}`}>
          {isAssistant ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          ) : (
            <div className="whitespace-pre-wrap leading-7 text-white">{message.content}</div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-700/30 pt-2 text-[10px]">
          {isAssistant && onToggleAudio && (
            <AudioPlayerButton
              messageId={msgId}
              text={message.content}
              isPlaying={isPlaying}
              isLoading={isLoading}
              onToggle={onToggleAudio}
            />
          )}

          {message.createdAt && (
            <div className={`mr-auto ${isAssistant ? 'text-slate-400' : 'text-emerald-100/80'}`}>
              {formatTime(message.createdAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

