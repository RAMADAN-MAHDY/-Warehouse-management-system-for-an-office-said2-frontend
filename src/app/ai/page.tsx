'use client';

import React, { useEffect, useState } from 'react';
import ConversationList from '@/components/ai/ConversationList';
import ChatWindow from '@/components/ai/ChatWindow';

export default function AIPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [showConversationList, setShowConversationList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const updateMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setShowConversationList(true);
    };

    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setShowConversationList(!selectedConversation);
    }
  }, [isMobile, selectedConversation]);

  const handleSelectConversation = (id: string | null) => {
    setSelectedConversation(id);
    if (isMobile) setShowConversationList(!id);
  };

  const handleConversationCreated = (id: string) => {
    setSelectedConversation(id);
    setReloadTrigger((s) => s + 1);
    if (isMobile) setShowConversationList(false);
  };

  return (
    <>
      <main className="flex min-h-[calc(100vh-5rem)] flex-col gap-4 p-3 lg:flex-row lg:p-4">
        <div className={`${isMobile ? (showConversationList ? 'block' : 'hidden') : 'block'} w-full lg:max-w-xs`}>
          <ConversationList
            selectedId={selectedConversation}
            onSelect={handleSelectConversation}
            reloadTrigger={reloadTrigger}
          />
        </div>

        <div className={`flex-1 min-h-0 ${isMobile && !showConversationList ? 'hidden' : 'block'}`}>
          <ChatWindow
            conversationId={selectedConversation}
            onConversationCreated={handleConversationCreated}
            onOpenConversations={() => setShowConversationList(true)}
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
