import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <section className="py-16 md:py-24 border-b-2 border-[#28cc28] last:border-b-0">
      <h2 className="text-4xl md:text-5xl mb-12 text-[#ccffcc] animate-text-flicker text-glow">
        &gt; {title}
      </h2>
      <div>{children}</div>
    </section>
  );
};

export default Section;
