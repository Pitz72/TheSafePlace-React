import React from 'react';
import { useCharacterStore } from '../store/characterStore';
import Icon from './ui/Icon';

const ALIGNMENT_THRESHOLD = 5;

/** Moral compass: the needle between Lena (compassion) and Elian (pragmatism). */
const AlignmentPanel: React.FC = () => {
    const alignment = useCharacterStore((state) => state.alignment);
    const { lena, elian } = alignment;

    const totalPoints = Math.max(1, lena + elian);
    const balance = totalPoints === 1 ? 0 : (elian - lena) / totalPoints;
    // From 0% (Lena) to 100% (Elian).
    const positionPercent = ((balance + 1) / 2) * 100;

    const difference = lena - elian;
    const dominant = difference > ALIGNMENT_THRESHOLD ? 'lena' : difference < -ALIGNMENT_THRESHOLD ? 'elian' : null;
    const label = dominant === 'lena' ? 'Compassionevole' : dominant === 'elian' ? 'Pragmatico' : 'In equilibrio';

    return (
        <section className="surface px-6 pb-5 pt-4">
            <header className="mb-3 flex items-center gap-2.5">
                <Icon name="compass" size={18} className="text-ink3" />
                <h2 className="eyebrow flex-1">Bussola morale</h2>
                <span className={`text-[17px] ${dominant === 'lena' ? 'text-lena' : dominant === 'elian' ? 'text-elian' : 'text-ink2'}`}>{label}</span>
            </header>
            <div className="flex items-center gap-3">
                <span className={`text-[18px] ${dominant === 'lena' ? 'font-semibold text-lena' : 'text-lena/80'}`}>Lena</span>
                <div className="relative h-2 flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, rgb(var(--c-lena)), rgb(var(--c-ink4) / 0.6) 50%, rgb(var(--c-elian)))' }}>
                    <div className="absolute left-1/2 top-1/2 h-3.5 w-px -translate-y-1/2 bg-ink3" />
                    <div
                        className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink bg-bg1 shadow-lg transition-[left] duration-700"
                        style={{ left: `${positionPercent}%` }}
                    />
                </div>
                <span className={`text-[18px] ${dominant === 'elian' ? 'font-semibold text-elian' : 'text-elian/80'}`}>Elian</span>
            </div>
        </section>
    );
};

export default AlignmentPanel;
