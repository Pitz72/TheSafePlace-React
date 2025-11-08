import React from 'react';
import { TimelineEvent } from '../types';

interface TimelineItemProps {
  event: TimelineEvent;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event }) => {
  return (
    <div className="relative pl-8">
      <div className="absolute top-2 -left-[29px] w-6 h-6 bg-[#00ff41] border-4 border-[#008f25] rounded-full z-10"></div>
      <div className="p-6 bg-[rgba(0,255,65,0.05)] border-2 border-[#008f25]">
        <h3 className="text-2xl text-[#aaffbe] mb-2 text-glow">
          {event.version}: {event.title}
        </h3>
        <p className="leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
};

export default TimelineItem;
