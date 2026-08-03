'use client';

import React, { useEffect, useState } from 'react';
import ConversationList from '@/components/ai/ConversationList';
import ChatWindow from '@/components/ai/ChatWindow';

export default function AIPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setShowList(mobile ? !selectedConversation : true);
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [selectedConversation]);

  const handleSelectConversation = (id: string | null) => {
    setSelectedConversation(id);
    if (isMobile) setShowList(!id);
  };

  const handleConversationCreated = (id: string) => {
    setSelectedConversation(id);
    setReloadTrigger((s) => s + 1);
    if (isMobile) setShowList(false);
  };

  return (
    <>
      <main className="flex min-h-[calc(100vh-5rem)] flex-col gap-4 p-3 lg:grid lg:grid-cols-[320px_1fr] lg:p-4">
        <div className={`${isMobile ? (showList ? 'block' : 'hidden') : 'block'} w-full lg:block`}>
          <ConversationList
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
            reloadTrigger={reloadTrigger}
          />
        </div>

        <div className={`${isMobile ? (showList ? 'hidden' : 'block') : 'block'} flex-1 min-h-0`}>
          <ChatWindow
            conversationId={selectedConversation}
            onConversationCreated={handleConversationCreated}
            onBack={() => setShowList(true)}
          />
        </div>
      </main>

      <button
        type="button"
        onClick={() => handleSelectConversation(null)}
        className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-blue-600/20 transition hover:bg-blue-500 lg:left-6 lg:translate-x-0"
      >
        محادثة جديدة
      </button>
    </>
  );
}
