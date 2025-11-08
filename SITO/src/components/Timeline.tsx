import React from 'react';
import { TimelineEvent } from '../types';
import TimelineItem from './TimelineItem';

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="relative pl-5 before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-1 before:bg-[#008f25]">
      <div className="space-y-12">
        {events.map((event) => (
          <TimelineItem key={event.version} event={event} />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
