import React from 'react';
import Icon, { IconName } from './Icon';
import KeyHints, { KeyHint } from './KeyHints';
import { Tone, accentVar } from '../../utils/palette';

const WIDTHS = {
    sm: 'w-[760px]',
    md: 'w-[1040px]',
    lg: 'w-[1320px]',
    xl: 'w-[1580px]',
    full: 'w-full h-full',
} as const;

interface ModalProps {
    /** Small spaced label above the title ("EVENTO", "DIALOGO"...). */
    eyebrow?: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    icon?: IconName;
    accent?: Tone;
    size?: keyof typeof WIDTHS;
    /** Illustration across the top of the card. */
    banner?: React.ReactNode;
    /** Content on the right of the header (counters, weight...). */
    aside?: React.ReactNode;
    hints?: KeyHint[];
    /**
     * What happens behind the card: 'blur' dims the game, 'soft' keeps the
     * illustration of the menus visible, 'scene' is cinematic and almost opaque.
     */
    backdrop?: 'blur' | 'soft' | 'scene';
    className?: string;
    bodyClassName?: string;
    children?: React.ReactNode;
}

/**
 * The card every overlay screen is built on: backdrop, header with eyebrow and
 * title, body, and the keyboard hints at the bottom.
 */
const Modal: React.FC<ModalProps> = ({
    eyebrow, title, subtitle, icon, accent = 'ember', size = 'md', banner, aside, hints,
    backdrop = 'blur', className = '', bodyClassName = '', children,
}) => (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-12" style={{ '--accent': accentVar(accent) } as React.CSSProperties}>
        <div
            className="absolute inset-0 anim-fade-in"
            style={{
                background: backdrop === 'scene'
                    ? 'radial-gradient(ellipse at 50% 40%, rgb(var(--c-bg1) / 0.9), rgb(var(--c-bg0) / 0.98))'
                    : backdrop === 'soft' ? 'radial-gradient(ellipse at 50% 50%, rgb(var(--c-bg0) / 0.55), rgb(var(--c-bg0) / 0.25))' : 'var(--backdrop)',
                backdropFilter: backdrop === 'soft' ? 'blur(3px)' : 'blur(calc(var(--blur) * 0.6))',
            }}
        />
        <div className={`surface relative flex max-h-full flex-col overflow-hidden anim-scale-in ${WIDTHS[size]} ${className}`} style={{ background: 'var(--glass-strong)' }}>
            {banner && <div className="relative flex-shrink-0">{banner}</div>}
            {(eyebrow || title || aside) && (
                <header className={`flex flex-shrink-0 items-end justify-between gap-8 px-12 ${banner ? 'pt-7' : 'pt-10'} pb-6`}>
                    <div className="min-w-0">
                        {eyebrow && (
                            <div className="eyebrow mb-3 flex items-center gap-2.5 text-accent">
                                {icon && <Icon name={icon} size={20} />}
                                <span>{eyebrow}</span>
                            </div>
                        )}
                        {title && <h1 className="title-display text-[56px] text-ink">{title}</h1>}
                        {subtitle && <div className="mt-3 text-[21px] leading-snug text-ink2">{subtitle}</div>}
                    </div>
                    {aside && <div className="flex-shrink-0">{aside}</div>}
                </header>
            )}
            <div className={`relative min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
            {hints && hints.length > 0 && (
                <footer className="flex-shrink-0 border-t border-line px-12 py-5">
                    <KeyHints hints={hints} />
                </footer>
            )}
        </div>
    </div>
);

export default Modal;
