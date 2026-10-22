import React, { useState } from 'react';
import Icon from './Icon';
import { TRAILER_YOUTUBE_ID } from '../constants';
import { imageUrl, srcSet } from '../images';

/**
 * The official teaser. YouTube is loaded only when the visitor presses play:
 * until then the page makes no request to it.
 */
const VideoTeaser: React.FC = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[22px] border border-line bg-bg1 shadow-[var(--shadow)]">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${TRAILER_YOUTUBE_ID}?autoplay=1&rel=0`}
          title="Teaser trailer ufficiale - The Safe Place Chronicles"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full">
          <img
            src={imageUrl('keyart-notte', 1920)}
            srcSet={srcSet('keyart-notte', [960, 1920])}
            sizes="(min-width: 1152px) 1088px, 100vw"
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,6,10,0.15),rgba(5,6,10,0.65))]" />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 sm:gap-5">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-ember2 to-ember pl-1 text-bg1 shadow-[0_0_0_10px_rgba(232,137,63,0.18),0_20px_50px_-12px_rgba(232,137,63,0.8)] transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
              <Icon name="play" size={30} className="[&_path]:fill-current" />
            </span>
            <span className="font-cond text-[15px] font-semibold uppercase tracking-[0.28em] text-ink sm:text-[17px]">Guarda il teaser</span>
          </span>
          <span className="absolute inset-x-0 bottom-0 hidden px-6 pb-4 text-center text-[14px] text-ink2 sm:block">
            Video su YouTube: si carica solo quando premi play.
          </span>
        </button>
      )}
    </div>
  );
};

export default VideoTeaser;
