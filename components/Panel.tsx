import React from 'react';

/**
 * Panel component.
 * This component renders a panel with a title and content.
 * @param {object} props - The props for the component.
 * @param {string} props.title - The title of the panel.
 * @param {React.ReactNode} props.children - The content of the panel.
 * @param {string} [props.className] - Additional CSS classes for the panel.
 * @returns {JSX.Element} The rendered Panel component.
 */
const Panel: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`border border-[var(--border-primary)] flex flex-col bg-black/20 ${className}`}>
    <h2 className="text-center bg-[var(--text-primary)]/10 py-0.5 font-bold tracking-widest uppercase text-base">{title}</h2>
    <div className="p-1.5 flex-grow overflow-hidden leading-tight">
      {children}
    </div>
  </div>
);

export default Panel;