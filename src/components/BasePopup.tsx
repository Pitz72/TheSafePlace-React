import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BasePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const BasePopup: React.FC<BasePopupProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = '' 
}) => {
  const popupRoot = document.getElementById('popup-root');

  // Gestione tasto ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !popupRoot) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center crt-screen scan-lines"
      onClick={onClose}
    >
      {/* Effetti CRT avanzati */}
      <div className="absolute inset-0 pointer-events-none animate-crt-flicker opacity-20"></div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-phosphor-primary/5 to-transparent"></div>
      
      <div 
        className={`
          relative bg-phosphor-panel border-2 border-phosphor-primary 
          text-phosphor-primary font-mono p-8 w-full max-w-4xl mx-4
          rounded-lg text-lg leading-relaxed
          glow-phosphor-primary shadow-phosphor-glow
          animate-phosphor-pulse
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con titolo */}
        <div className="border-b border-phosphor-primary pb-3 mb-6">
          <h2 className="text-center text-phosphor-bright font-bold text-2xl tracking-wider text-shadow-phosphor-bright animate-glow">
            {title}
          </h2>
        </div>

        {/* Contenuto */}
        <div className="mb-6 text-lg">
          {children}
        </div>

        {/* Footer con istruzioni */}
        <div className="border-t border-phosphor-primary pt-3 text-center text-lg text-phosphor-bright font-bold animate-pulse">
          [ESC] Chiudi
        </div>
      </div>
    </div>,
    popupRoot
  );
};

export default BasePopup;