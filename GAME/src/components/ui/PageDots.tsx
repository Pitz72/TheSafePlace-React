import React from 'react';

/** Page indicator: one short bar per page, the current one long and lit. */
const PageDots: React.FC<{ count: number; current: number }> = ({ count, current }) => (
    <div className="flex items-center gap-2">
        {Array.from({ length: count }, (_, index) => (
            <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === current ? 'w-10 bg-accent' : index < current ? 'w-3 bg-ink3' : 'w-3 bg-ink4/60'}`}
            />
        ))}
    </div>
);

export default PageDots;
