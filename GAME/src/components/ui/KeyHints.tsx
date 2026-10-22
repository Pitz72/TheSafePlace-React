import React from 'react';
import Icon, { IconName } from './Icon';

export interface KeyHint {
    /** Keys shown as keycaps: 'ESC', 'INVIO', 'I', or arrows ('↑', '↓', '←', '→', '↑↓', '←→'). */
    keys: string[];
    label: string;
    /** Greyed out (the action isn't available right now). */
    muted?: boolean;
    /** Highlighted (something is waiting for this key). */
    active?: boolean;
}

const ARROWS: Record<string, IconName> = { '↑': 'arrowUp', '↓': 'arrowDown', '←': 'arrowLeft', '→': 'arrowRight' };

/** One keycap. Arrow characters become icons. */
export const Key: React.FC<{ k: string }> = ({ k }) => {
    const arrows = [...k].every(char => ARROWS[char]) ? [...k] : null;
    return (
        <kbd className="kbd">
            {arrows ? arrows.map((char, index) => <Icon key={index} name={ARROWS[char]} size={15} strokeWidth={2.2} />) : k}
        </kbd>
    );
};

/** A row of keyboard hints: keycaps followed by what they do. */
const KeyHints: React.FC<{ hints: KeyHint[]; className?: string; align?: 'start' | 'center' | 'end' | 'between' }> = ({ hints, className = '', align = 'center' }) => {
    const justify = { start: 'justify-start', center: 'justify-center', end: 'justify-end', between: 'justify-between' }[align];
    return (
        <div className={`flex flex-wrap items-center gap-x-7 gap-y-2 ${justify} ${className}`}>
            {hints.map(hint => (
                <div
                    key={hint.label}
                    className={`flex items-center gap-2.5 transition-opacity ${hint.muted ? 'opacity-35' : ''} ${hint.active ? 'text-ember' : 'text-ink2'}`}
                >
                    <span className="flex items-center gap-1">
                        {hint.keys.map(key => <Key key={key} k={key} />)}
                    </span>
                    <span className="text-[18px] leading-none">{hint.label}</span>
                </div>
            ))}
        </div>
    );
};

export default KeyHints;
