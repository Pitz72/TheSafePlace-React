import React from 'react';
import Reveal from './Reveal';

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ id, eyebrow, title, lead, children, className = '' }) => {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`relative py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className="title-display mt-4 text-[2.6rem] text-ink sm:text-6xl">
            {title}
          </h2>
          {lead && <div className="prose-story mt-6 text-lg text-ink2">{lead}</div>}
        </Reveal>
        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  );
};

export default Section;
