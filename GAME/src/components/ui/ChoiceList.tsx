import React, { useEffect, useRef } from 'react';
import Icon, { IconName } from './Icon';

export interface ChoiceItem {
    id: string;
    label: React.ReactNode;
    /** Second line under the label. */
    detail?: React.ReactNode;
    icon?: IconName;
    /** Right-aligned content (values, counters). */
    meta?: React.ReactNode;
    disabled?: boolean;
    /** Already chosen/added (e.g. an item in the trade offer). */
    marked?: boolean;
    color?: string;
}

interface ChoiceListProps {
    items: ChoiceItem[];
    selected: number;
    /** Show 1, 2, 3... in front of each choice (the number keys pick it). */
    numbered?: boolean;
    /** The list has the focus (otherwise the selection is shown dimmed). */
    active?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const TEXT = { sm: 'text-[19px]', md: 'text-[22px]', lg: 'text-[25px]' };

/** Vertical list of choices driven by the keyboard; keeps the selection in view. */
const ChoiceList: React.FC<ChoiceListProps> = ({ items, selected, numbered = false, active = true, size = 'md', className = '' }) => {
    const selectedRef = useRef<HTMLLIElement>(null);
    useEffect(() => {
        selectedRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    }, [selected]);

    return (
        <ul className={`flex flex-col gap-1.5 ${className}`}>
            {items.map((item, index) => {
                const isSelected = index === selected && active && !item.disabled;
                const isCursor = index === selected && !active;
                return (
                    <li
                        key={item.id}
                        ref={index === selected ? selectedRef : null}
                        className={`choice ${TEXT[size]} ${size === 'sm' ? '!py-2.5' : ''} ${isSelected ? 'is-selected' : ''} ${item.disabled ? 'is-disabled' : ''} ${isCursor ? '!border-line2' : ''}`}
                    >
                        {numbered && (
                            <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border font-cond text-[17px] font-semibold ${isSelected ? 'border-accent bg-accent text-bg0' : 'border-line2 text-ink3'}`}>
                                {index + 1}
                            </span>
                        )}
                        {item.icon && <Icon name={item.icon} size={size === 'lg' ? 26 : 22} className={isSelected ? 'text-accent' : 'text-ink3'} />}
                        <div className="min-w-0 flex-1">
                            <div className="leading-snug" style={{ color: !isSelected && !item.disabled ? item.color : undefined }}>
                                {item.marked && <Icon name="check" size={18} className="mr-2 inline -translate-y-0.5 text-sage" strokeWidth={2.4} />}
                                {item.label}
                            </div>
                            {item.detail && <div className="mt-1 text-[17px] leading-snug text-ink3">{item.detail}</div>}
                        </div>
                        {item.meta && <div className="flex-shrink-0 text-[18px] text-ink3 tnum">{item.meta}</div>}
                        {item.disabled
                            ? <Icon name="lock" size={18} className="text-ink4" />
                            : <Icon name="chevronRight" size={20} className={`transition-opacity ${isSelected ? 'text-accent opacity-100' : 'opacity-0'}`} />}
                    </li>
                );
            })}
        </ul>
    );
};

export default ChoiceList;
