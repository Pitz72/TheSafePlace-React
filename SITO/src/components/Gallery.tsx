import React, { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import Reveal from './Reveal';
import { GALLERY, imageUrl, srcSet } from '../images';
import { GalleryImage } from '../types';

const isPortrait = (image: GalleryImage) => image.height > image.width;

interface ThumbProps {
  image: GalleryImage;
  sizes: string;
  onOpen: () => void;
  /** On large screens, crop the image to fill its cell (the bento grid). */
  fill?: boolean;
  className?: string;
}

// The caption sits under the image: the covers carry their own texts at the bottom.
const Thumb: React.FC<ThumbProps> = ({ image, sizes, onOpen, fill = false, className = '' }) => (
  <figure className={`flex flex-col ${className}`}>
    <button
      type="button"
      onClick={onOpen}
      className={`group relative block w-full overflow-hidden rounded-[18px] border border-line bg-bg2 ${fill ? 'lg:min-h-0 lg:flex-1' : ''}`}
    >
      <img
        src={imageUrl(image.name, image.widths[0])}
        srcSet={srcSet(image.name, image.widths)}
        sizes={sizes}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        decoding="async"
        className={`block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] ${fill ? 'lg:absolute lg:inset-0 lg:h-full lg:object-cover lg:object-[65%_50%]' : ''}`}
      />
      <span className="sr-only">(ingrandisci)</span>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-300 group-hover:bg-black/25 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line3 bg-bg1/70 text-ink backdrop-blur">
          <Icon name="expand" />
        </span>
      </span>
    </button>
    <figcaption className="mt-3 font-cond text-[14px] font-semibold uppercase tracking-[0.24em] text-ink2">{image.title}</figcaption>
  </figure>
);

const Gallery: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? null : GALLERY[index];

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + GALLERY.length) % GALLERY.length));

  // The page behind the lightbox doesn't scroll.
  useEffect(() => {
    if (index === null) return;
    const { documentElement } = document;
    documentElement.style.overflow = 'hidden';
    return () => {
      documentElement.style.overflow = '';
    };
  }, [index]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  };

  const [cover, poster, vertical, dawn, night] = GALLERY;
  const at = (image: GalleryImage) => GALLERY.indexOf(image);
  const cell = '(min-width: 1152px) 350px, (min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw';
  const roundButton = 'flex h-12 w-12 items-center justify-center rounded-full border border-line2 bg-bg1/80 text-ink transition-colors hover:border-ember/70 hover:bg-ember/15';

  return (
    <>
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Reveal className="md:col-span-2 lg:col-span-3">
          <Thumb image={cover} sizes="(min-width: 1152px) 1088px, 100vw" onOpen={() => open(at(cover))} />
        </Reveal>
        <Reveal className="lg:row-span-2">
          <Thumb image={poster} sizes={cell} onOpen={() => open(at(poster))} />
        </Reveal>
        <Reveal className="lg:row-span-2" delay={100}>
          <Thumb image={vertical} sizes={cell} onOpen={() => open(at(vertical))} />
        </Reveal>
        <Reveal delay={200}>
          <Thumb image={dawn} sizes={cell} fill className="h-full" onOpen={() => open(at(dawn))} />
        </Reveal>
        <Reveal delay={300}>
          <Thumb image={night} sizes={cell} fill className="h-full" onOpen={() => open(at(night))} />
        </Reveal>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onKeyDown={onKeyDown}
        aria-label={current ? current.title : 'Galleria'}
        className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-[rgba(5,6,10,0.92)] backdrop:backdrop-blur-sm"
      >
        {current && index !== null && (
          <figure
            className="flex h-full w-full flex-col items-center justify-center gap-5 px-4 pb-24 pt-20 sm:px-24 sm:pb-8"
            onClick={(event) => event.target === event.currentTarget && close()}
          >
            <img
              key={current.name}
              src={imageUrl(current.name, current.widths[current.widths.length - 1])}
              srcSet={srcSet(current.name, current.widths)}
              sizes={isPortrait(current) ? '(min-aspect-ratio: 2/3) 60vh, 100vw' : '100vw'}
              alt={current.alt}
              className="anim-fade-in max-h-[calc(100%-4rem)] w-auto max-w-full rounded-xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
              style={{ animationDuration: '400ms' }}
            />
            <figcaption className="text-center">
              <span className="font-cond text-[15px] font-semibold uppercase tracking-[0.24em] text-ink">{current.title}</span>
              <span className="ml-3 font-cond text-[14px] tracking-[0.2em] text-ink3">
                {index + 1} / {GALLERY.length}
              </span>
            </figcaption>
          </figure>
        )}
        <button type="button" onClick={close} className={`absolute right-4 top-4 sm:right-6 sm:top-6 ${roundButton}`} aria-label="Chiudi">
          <Icon name="close" />
        </button>
        <button type="button" onClick={() => step(-1)} className={`absolute bottom-5 left-4 sm:bottom-auto sm:left-6 sm:top-1/2 sm:-translate-y-1/2 ${roundButton}`} aria-label="Immagine precedente">
          <Icon name="chevronLeft" />
        </button>
        <button type="button" onClick={() => step(1)} className={`absolute bottom-5 right-4 sm:bottom-auto sm:right-6 sm:top-1/2 sm:-translate-y-1/2 ${roundButton}`} aria-label="Immagine successiva">
          <Icon name="chevronRight" />
        </button>
      </dialog>
    </>
  );
};

export default Gallery;
