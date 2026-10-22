import React from 'react';
import KeyArt, { KeyArtVariant } from '../components/art/KeyArt';
import Logo, { Emblem } from '../components/art/Logo';
import { TRAVELLER_FIGURE } from '../assets/art';

/**
 * Compositions drawn by preview.html (development only): the key art,
 * covers, poster and app icon, exported by scripts/export-art.mjs.
 * ?art=keyart&variant=dusk
 */
const params = new URLSearchParams(window.location.search);
const art = params.get('art') ?? 'keyart';
const variant = (params.get('variant') ?? 'dusk') as KeyArtVariant;
const animated = params.get('animated') !== '0';

/** Vertical crop of the scene centered on the road and the sun. */
const portraitFrame = (aspect: number) => {
    const width = Math.round(1080 * aspect);
    return `${1240 - Math.round(width / 2)} 0 ${width} 1080`;
};

// Icons are exported with a transparent background around the rounded tile.
if (art === 'icon') document.documentElement.style.background = document.body.style.background = 'transparent';

const Fill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: art === 'icon' ? 'transparent' : '#0b0d11' }}>{children}</div>
);

/** 16:9 cover: the scene, the logo on the left. */
const CoverLandscape: React.FC = () => (
    <Fill>
        <KeyArt variant={variant} shade="left" animated={false} figure={TRAVELLER_FIGURE} />
        <div className="absolute inset-0 flex flex-col justify-center" style={{ paddingLeft: '7%' }}>
            <Logo scale={1.12} />
            <p className="prose-story mt-8 text-[26px] italic text-ink2">Un gioco di ruolo di Simone Pizzi</p>
        </div>
        <div className="absolute bottom-[5%] left-[7%] font-cond text-[16px] font-semibold uppercase tracking-[0.4em] text-ink3">Runtime Radio</div>
    </Fill>
);

/** Portrait cover (store, book): title on top, the road below. */
const CoverPortrait: React.FC = () => (
    <Fill>
        <KeyArt variant={variant} shade="none" animated={false} figure={TRAVELLER_FIGURE} frame={portraitFrame(window.innerWidth / window.innerHeight)} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(6,7,11,0.86) 0%, rgba(6,7,11,0.35) 34%, rgba(6,7,11,0) 50%, rgba(6,7,11,0) 78%, rgba(6,7,11,0.85) 100%)' }} />
        <div className="absolute inset-x-0 top-[6%] flex justify-center">
            <Logo align="center" scale={0.78} />
        </div>
        <div className="absolute inset-x-0 bottom-[4.5%] text-center">
            <div className="font-cond text-[19px] font-semibold uppercase tracking-[0.42em] text-ink">Un gioco di ruolo di Simone Pizzi</div>
            <div className="mt-3 font-cond text-[13px] font-semibold uppercase tracking-[0.5em] text-ink3">Runtime Radio</div>
        </div>
    </Fill>
);

/** Theatrical poster: tagline, title low, billing block. */
const Poster: React.FC = () => (
    <Fill>
        <KeyArt variant={variant} shade="none" animated={false} figure={TRAVELLER_FIGURE} frame={portraitFrame(window.innerWidth / window.innerHeight)} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(6,7,11,0.7) 0%, rgba(6,7,11,0) 22%, rgba(6,7,11,0) 44%, rgba(6,7,11,0.7) 62%, rgba(6,7,11,0.97) 82%)' }} />
        <p className="prose-story absolute inset-x-0 top-[5.5%] text-center text-[25px] italic text-ink2">Ogni passo è un'eco. Ogni eco, una scelta.</p>
        <div className="absolute inset-x-0 top-[51%] flex justify-center">
            <Logo align="center" scale={0.84} />
        </div>
        <div className="absolute inset-x-[8%] bottom-[4%] text-center font-cond uppercase text-ink3" style={{ fontWeight: 500 }}>
            <div className="text-[15px] tracking-[0.32em]">
                Runtime Radio <span className="text-ink4">presenta</span>&nbsp;&nbsp; un gioco di <span className="text-ink2">Simone Pizzi</span>
            </div>
            <div className="mt-2 text-[13px] leading-[1.7] tracking-[0.26em]">
                <span className="text-ink4">scrittura e game design</span> Simone Pizzi &nbsp;
                <span className="text-ink4">mondo e narrativa</span> Simone Pizzi &nbsp;
                <span className="text-ink4">sviluppo</span> Simone Pizzi <span className="text-ink4">con il supporto di un LLM</span> &nbsp;
                <span className="text-ink4">produzione</span> Runtime Radio
            </div>
            <div className="mx-auto my-4 h-px w-24 bg-ember/70" />
            <div className="text-[14px] tracking-[0.5em] text-ink2">Windows · macOS · Linux</div>
        </div>
    </Fill>
);

/** App icon: the emblem on a dark tile with a warm glow. */
const AppIcon: React.FC<{ simple?: boolean }> = ({ simple }) => (
    <Fill>
        <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
                borderRadius: params.get('square') ? 0 : '22.5%',
                background: 'radial-gradient(circle at 50% 78%, rgba(232,137,63,0.42), rgba(232,137,63,0) 55%), linear-gradient(180deg, #1b1e27, #0b0d12)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
        >
            <Emblem size={Math.min(window.innerWidth, window.innerHeight) * (simple ? 0.8 : 0.7)} className="text-[#efe7da]" simple={simple} />
        </div>
    </Fill>
);

export const Preview: React.FC = () => {
    switch (art) {
        case 'cover-landscape': return <CoverLandscape />;
        case 'cover-portrait': return <CoverPortrait />;
        case 'poster': return <Poster />;
        case 'icon': return <AppIcon simple={params.get('simple') === '1'} />;
        default:
            return <Fill><KeyArt variant={variant} animated={animated} shade={(params.get('shade') as 'left' | 'none') ?? 'none'} /></Fill>;
    }
};

