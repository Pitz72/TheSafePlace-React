
import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description }) => {
  return (
    <div className="border-2 border-[#008f25] p-6 bg-[rgba(0,255,65,0.05)] transition-all duration-300 ease-in-out hover:transform hover:-translate-y-1 hover:border-[#00ff41] hover:shadow-[0_0_15px_rgba(0,255,65,0.3)]">
      <h3 className="text-2xl mb-4 text-[#aaffbe] text-glow">{title}</h3>
      <p className="leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
