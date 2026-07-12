import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 px-5 text-center text-sm text-[#28cc28] border-t-2 border-[#28cc28] mt-16">
      <div className="max-w-5xl mx-auto space-y-2">
        <p>(C) 2025 Runtime Radio &mdash; gioco di ispirazione retrocomputazionale realizzato tramite supporto LLM.</p>
        <p>
          Progetto open source &middot;{' '}
          <a href="https://github.com/Pitz72/TheSafePlace-React" className="text-[#ccffcc] hover:text-[#33ff33] underline transition-colors" target="_blank" rel="noopener noreferrer">
            github.com/Pitz72/TheSafePlace-React
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
