import React from 'react';

/**
 * Line icons on a 24px grid, 1.7px stroke, rounded caps: the icon set of the
 * game (GAME/src/components/ui/Icon.tsx), plus the marks of the three systems.
 * `solid` paths are filled, `dots` are small filled circles.
 */
interface IconShape {
  d: string;
  solid?: string;
  dots?: [number, number, number?][];
}

const ICONS = {
  heart: { d: 'M12 20s-7.2-4.4-7.2-10.1A4.1 4.1 0 0 1 12 7.5a4.1 4.1 0 0 1 7.2 2.4C19.2 15.6 12 20 12 20z' },
  map: { d: 'M3.5 6.2L9 4l6 2.2L20.5 4v13.8L15 20l-6-2.2-5.5 2.2z M9 4v13.8 M15 6.2V20' },
  compass: { d: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z', solid: 'M15.4 8.6l-2 4.8-4.8 2 2-4.8z' },
  shield: { d: 'M12 3l7.5 3v5.5c0 4.5-3.2 8.2-7.5 9.5-4.3-1.3-7.5-5-7.5-9.5V6z' },
  book: { d: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H11a1 1 0 0 1 1 1v15a1.5 1.5 0 0 0-1.5-1.5H4z M20 5.5A1.5 1.5 0 0 0 18.5 4H13a1 1 0 0 0-1 1v15a1.5 1.5 0 0 1 1.5-1.5H20z' },
  hammer: { d: 'M12.5 4.5h5.5l2.5 2.5-2 2h-6z M15 9l-9.6 9.6a1.6 1.6 0 0 0 2.3 2.3L17.2 11.3' },
  echo: { d: 'M8.8 10.3a4.5 4.5 0 0 1 6.4 0 M6 7.5a8.5 8.5 0 0 1 12 0 M8.8 16.7a4.5 4.5 0 0 0 6.4 0 M6 19.5a8.5 8.5 0 0 0 12 0', dots: [[12, 13.5, 1.5]] },
  sparkle: { d: 'M12 3l1.8 5.4L19 10.2l-5.2 1.8-1.8 5.5-1.8-5.5L5 10.2l5.2-1.8z M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z' },
  signpost: { d: 'M12 3v18 M12 5.5h6.5l2 2-2 2H12 M12 11.5H5.5l-2 2 2 2H12 M9 21h6' },
  globe: { d: 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z M3.5 12h17 M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5s-1.1 6.1-3.4 8.5 M12 3.5C9.7 5.9 8.6 8.7 8.6 12s1.1 6.1 3.4 8.5' },
  code: { d: 'M8.5 7.5L4 12l4.5 4.5 M15.5 7.5L20 12l-4.5 4.5 M13.5 5l-3 14' },
  mail: { d: 'M4 6h16v12H4z M4.5 6.5l7.5 6 7.5-6' },
  download: { d: 'M12 4v11 M7.5 10.5L12 15l4.5-4.5 M4.5 19.5h15' },
  external: { d: 'M13.5 4.5h6v6 M19.5 4.5L11 13 M17.5 14v4.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H10' },
  expand: { d: 'M4.5 9.5v-5h5 M19.5 9.5v-5h-5 M4.5 14.5v5h5 M19.5 14.5v5h-5' },
  play: { d: 'M7.5 4.8v14.4L19 12z' },
  warning: { d: 'M12 4l9 16H3z M12 10v4.5', dots: [[12, 17.4, 1.1]] },
  chevronLeft: { d: 'M15 5l-7 7 7 7' },
  chevronRight: { d: 'M9 5l7 7-7 7' },
  chevronDown: { d: 'M5 9l7 7 7-7' },
  arrowRight: { d: 'M5 12h14 M13 6l6 6-6 6' },
  close: { d: 'M6 6l12 12 M18 6L6 18' },
  windows: { d: 'M3.5 5.6l7.5-1.2v7.1H3.5z M13 4.1l7.5-1.2v8.6H13z M3.5 12.5H11v7.1l-7.5-1.2z M13 12.5h7.5v8.6L13 19.9z' },
  macos: { d: 'M9 9V6.5a2.5 2.5 0 1 0-2.5 2.5H9zm0 0h6m-6 0v6m6-6V6.5A2.5 2.5 0 1 1 17.5 9H15zm0 0v6m0 0h2.5a2.5 2.5 0 1 1-2.5 2.5V15zm0 0H9m0 0v2.5A2.5 2.5 0 1 1 6.5 15H9z' },
  linux: {
    d: 'M12 3c-2.2 0-3.5 1.8-3.5 4.2 0 1.3-.5 2.3-1.3 3.4C6 12.2 5 14.2 5 16.4c0 1 .3 1.8.8 2.4 M12 3c2.2 0 3.5 1.8 3.5 4.2 0 1.3.5 2.3 1.3 3.4 1.2 1.6 2.2 3.6 2.2 5.8 0 1-.3 1.8-.8 2.4 M9.6 11.6c-.7 1.3-1.1 2.8-1.1 4.4 0 1.6.4 3 1.1 4 M14.4 11.6c.7 1.3 1.1 2.8 1.1 4.4 0 1.6-.4 3-1.1 4 M4.5 20.5L8 18.6l1.6 2.4z M19.5 20.5L16 18.6l-1.6 2.4z M10.8 9.3h2.4L12 10.6z',
    dots: [[10.6, 7.1, 0.9], [13.4, 7.1, 0.9]],
  },
} satisfies Record<string, IconShape>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  title?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, strokeWidth = 1.7, className, title }) => {
  const icon: IconShape = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={icon.d} />
      {icon.solid && <path d={icon.solid} fill="currentColor" stroke="none" />}
      {icon.dots?.map(([cx, cy, r = 1.25], index) => <circle key={index} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />)}
    </svg>
  );
};

export default Icon;
