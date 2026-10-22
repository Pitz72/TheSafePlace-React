import React from 'react';
import { TimelineEvent } from '../types';
import Reveal from './Reveal';

interface TimelineItemProps {
  event: TimelineEvent;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event }) => {
  return (
    <li className="relative pb-10 pl-8 last:pb-0 sm:pl-12">
      <span
        className={`absolute -left-[7px] top-2 h-[13px] w-[13px] rounded-full border-2 border-bg0 ${event.upcoming ? 'bg-ember shadow-[0_0_0_4px_rgba(232,137,63,0.2)]' : 'bg-ink3'}`}
        aria-hidden="true"
      />
      <Reveal>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-cond text-[16px] font-semibold tracking-[0.16em] text-ember">{event.version}</span>
          {event.upcoming && <span className="chip text-ember2">Prossima release</span>}
        </div>
        <h3 className="title-display mt-2 text-[1.75rem] text-ink">{event.title}</h3>
        <p className="mt-2 max-w-3xl text-[16.5px] leading-relaxed text-ink2">{event.description}</p>
      </Reveal>
    </li>
  );
};

export default TimelineItem;
