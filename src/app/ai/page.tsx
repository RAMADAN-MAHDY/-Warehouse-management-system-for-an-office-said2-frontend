'use client';

import React, { useState } from 'react';
import ConversationList from '@/components/ai/ConversationList';
import ChatWindow from '@/components/ai/ChatWindow';

export default function AIPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  return (
    <>
      <main className="flex h-[80vh] gap-4 p-4">
        <ConversationList
          selectedId={selectedConversation}
          onSelect={(id) => setSelectedConversation(id)}
          reloadTrigger={reloadTrigger}
        />
        <div className="flex-1">
          <ChatWindow
            conversationId={selectedConversation}
            onConversationCreated={(id) => {
              setSelectedConversation(id);
              setReloadTrigger((s) => s + 1);
            }}
          />
        </div>
      </main>

      <button
        type="button"
        onClick={() => setSelectedConversation(null)}
        className="fixed bottom-6 left-6 z-30 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-blue-600/20 transition hover:bg-blue-500"
      >
        محادثة جديدة
      </button>
    </>
  );
}
