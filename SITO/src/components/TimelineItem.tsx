import React from 'react';
import { TimelineEvent } from '../types';

interface TimelineItemProps {
  event: TimelineEvent;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event }) => {
  return (
    <div className="relative pl-8">
      <div className="absolute top-2 -left-[29px] w-6 h-6 bg-[#33ff33] border-4 border-[#28cc28] rounded-full z-10"></div>
      <div className="p-6 bg-[rgba(51,255,51,0.05)] border-2 border-[#28cc28]">
        <h3 className="text-2xl text-[#ccffcc] mb-2 text-glow">
          {event.version}: {event.title}
        </h3>
        <p className="leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
};

export default TimelineItem;
