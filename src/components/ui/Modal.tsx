'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  maxWidth = 'md',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={cn(
          "glass-card w-full p-5 sm:p-8 rounded-[2rem] border border-gray-700 animate-in zoom-in duration-300 my-auto shadow-2xl relative",
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center mb-6">
            {title ? (
              <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
            ) : (
              <div />
            )}
            {showCloseButton && (
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-full"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
