import React from 'react';
import Icon, { IconName } from './Icon';
import { Tone, toneColor } from '../../utils/palette';

interface MeterProps {
    value: number;
    max: number;
    tone: Tone;
    height?: number;
    className?: string;
}

/** Thin progress bar in a palette tone. */
export const Meter: React.FC<MeterProps> = ({ value, max, tone, height = 6, className = '' }) => {
    const percent = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return (
        <div className={`meter ${className}`} style={{ height }}>
            <span style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${toneColor(tone, 0.55)}, ${toneColor(tone)})`, boxShadow: `0 0 12px ${toneColor(tone, 0.45)}` }} />
        </div>
    );
};

interface StatMeterProps extends MeterProps {
    icon: IconName;
    label: string;
    /** Shown in red and pulsing. */
    critical?: boolean;
}

/** Labelled meter: icon, name, value and bar. */
export const StatMeter: React.FC<StatMeterProps> = ({ icon, label, value, max, tone, critical, className = '' }) => (
    <div className={className}>
        <div className="mb-2 flex items-center gap-2.5">
            <Icon name={icon} size={20} style={{ color: toneColor(critical ? 'danger' : tone) }} className={critical ? 'anim-breathe' : ''} />
            <span className={`flex-1 text-[18px] ${critical ? 'text-danger' : 'text-ink2'}`}>{label}</span>
            <span className={`tnum text-[18px] font-semibold ${critical ? 'text-danger' : 'text-ink'}`}>
                {Math.floor(value)}<span className="font-normal text-ink3">/{max}</span>
            </span>
        </div>
        <Meter value={value} max={max} tone={critical ? 'danger' : tone} />
    </div>
);
