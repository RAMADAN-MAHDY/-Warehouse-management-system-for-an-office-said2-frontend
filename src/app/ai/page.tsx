'use client';

import React, { useEffect, useState } from 'react';
import ConversationList from '@/components/ai/ConversationList';
import ChatWindow from '@/components/ai/ChatWindow';

export default function AIPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)');
    const update = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setShowSidebar(!mobile);
    };

    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const handleSelectConversation = (id: string | null) => {
    setSelectedConversation(id);
    if (isMobile) setShowSidebar(false);
  };

  const handleConversationCreated = (id: string) => {
    setSelectedConversation(id);
    setReloadTrigger((value) => value + 1);
    if (isMobile) setShowSidebar(false);
  };

  return (
    <main className="relative h-[calc(100vh-5rem)] overflow-hidden p-0 lg:p-4">
      {isMobile && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          className={`fixed inset-0 z-30 bg-slate-950/70 transition ${showSidebar ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div className="flex h-full overflow-hidden rounded-2xl lg:rounded-[32px] border border-slate-800 bg-slate-950 lg:flex-row lg:gap-4">
        <div
          className={`absolute inset-y-0 right-0 z-40 w-[86vw] max-w-[320px] transition-transform duration-300 lg:static lg:w-[280px] lg:translate-x-0 ${
            isMobile ? (showSidebar ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'
          }`}
        >
          <div className="h-full w-full lg:rounded-[28px]">
            <ConversationList
              selectedId={selectedConversation}
              onSelect={handleSelectConversation}
              reloadTrigger={reloadTrigger}
              onClose={() => setShowSidebar(false)}
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 lg:ml-0">
          <ChatWindow
            conversationId={selectedConversation}
            onConversationCreated={handleConversationCreated}
            onBack={() => setShowSidebar((value) => !value)}
            isSidebarOpen={showSidebar}
          />
        </div>
      </div>
    </main>
  );
}
