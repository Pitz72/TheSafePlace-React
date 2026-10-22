import React from 'react';
import { TimelineEvent } from '../types';
import TimelineItem from './TimelineItem';

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <ol className="relative ml-2 border-l border-line2 sm:ml-3">
      {events.map((event) => (
        <TimelineItem key={event.version} event={event} />
      ))}
    </ol>
  );
};

export default Timeline;
