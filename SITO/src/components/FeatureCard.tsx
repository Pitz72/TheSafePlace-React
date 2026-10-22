import React from 'react';
import Icon from './Icon';
import { Feature } from '../types';

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => {
  return (
    <div className="surface-flat group h-full p-7 transition-colors duration-300 hover:border-[color:var(--line-2)] hover:bg-white/[0.04]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ember/40 bg-ember/10 text-ember transition-colors group-hover:bg-ember/20">
        <Icon name={feature.icon} />
      </span>
      <h3 className="title-display mt-6 text-[1.75rem] text-ink">{feature.title}</h3>
      <p className="mt-3 text-[16.5px] leading-relaxed text-ink2">{feature.description}</p>
    </div>
  );
};

export default FeatureCard;
