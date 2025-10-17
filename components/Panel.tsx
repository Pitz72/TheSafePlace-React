import React from 'react';

const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`border border-[var(--border-primary)] flex flex-col bg-black/20 ${className}`}>
    <h2 className="text-center bg-[var(--text-primary)]/10 py-1 font-bold tracking-widest uppercase text-2xl">{title}</h2>
    <div className="p-2 flex-grow overflow-hidden text-2xl leading-snug">
      {children}
    </div>
  </div>
);

export default Panel;