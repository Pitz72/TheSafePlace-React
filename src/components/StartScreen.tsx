import React from 'react';
import { useGameContext } from '../hooks/useGameContext';

const StartScreen: React.FC = () => {
  const { menuSelectedIndex, handleNewGame, handleLoadGame, handleStory, handleInstructions, handleOptions, handleExit } = useGameContext();
  
  const menuItems = [
    { key: 'N', label: 'Nuova Partita', action: handleNewGame },
    { key: 'C', label: 'Carica Partita', action: handleLoadGame },
    { key: 'I', label: 'Istruzioni', action: handleInstructions },
    { key: 'T', label: 'Storia', action: handleStory },
    { key: 'O', label: 'Opzioni', action: handleOptions },
    { key: 'E', label: 'Esci', action: handleExit }
  ];

  return (
    <div className="h-full flex justify-center overflow-y-auto crt-screen scan-lines"> {/* items-center rimosso per permettere controllo fine delle spaziature verticali e margini tra elementi */}
      <div className="w-full mx-4 text-center relative pt-16"> {/* pt-16 aggiunto per centratura visiva mantenendo flessibilità sui margini */}
        {/* Effetti CRT di sfondo */}
        <div className="absolute inset-0 pointer-events-none animate-crt-flicker opacity-10"></div>
        
        {/* Logo */}
        {/* TODO: Investigare perché le modifiche ai margini dell'immagine (mb-1, mb-0, mb-4) non hanno effetto visibile */}
        <img 
          src="/logo.jpg" 
          alt="The Safe Place Logo" 
          className="max-w-[34%] h-auto max-h-[34vh] object-contain mx-auto mb-1 glow-phosphor-dim animate-pulse"
        />
        
        {/* Titolo */}
        <h1 className="text-phosphor-bright font-bold mb-1 text-shadow-phosphor-bright animate-glow tracking-wider" style={{ fontSize: '100px' }}>
          THE SAFE PLACE
        </h1>
        
        {/* Autore */}
        <p className="text-phosphor-primary text-xl mb-1 -mt-2 text-shadow-phosphor-primary animate-pulse">
          un gioco di Simone Pizzi
        </p>
        
        {/* Versione */}
        <p className="text-phosphor-dim text-lg mb-6 tracking-wider glow-phosphor-dim">
          v0.3.0 - A Letter by Me, My Son
        </p>
        
        {/* Menu Items Testuali */}
        <div className="space-y-2 mb-8">
          {menuItems.map((item, index) => (
            <div
              key={item.key}
              className={`text-center cursor-pointer transition-all duration-200 text-[2.4rem] px-4 py-2 rounded-lg ${
                menuSelectedIndex === index
                  ? 'text-phosphor-bright font-black text-shadow-phosphor-bright animate-glow glow-phosphor-bright bg-phosphor-highlight bg-opacity-40 border-2 border-phosphor-bright' 
                  : 'text-phosphor-primary glow-phosphor-primary hover:text-phosphor-bright hover:glow-phosphor-bright'
              }`}
              onClick={item.action}
            >
              <span className="text-phosphor-bright animate-pulse">[{item.key}]</span> {item.label}
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="text-phosphor-dim text-base leading-relaxed mx-auto glow-phosphor-dim animate-pulse">
          <p className="mb-2 text-shadow-phosphor-dim">
            Questo GDR Testuale in stile retrocomputazionale è una sperimentazione di cooperazione diretta tra umano designer non programmatore e i modelli LLM tramite Cursor.
          </p>
          <p className="text-shadow-phosphor-dim">
            Il progetto è un (C) di Runtime Radio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;