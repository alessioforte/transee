import { CSSProperties, FunctionComponent } from 'react';
import icons from './icons';
import { getColorLuminance } from '@/shared/color';
import styles from './Icon.module.css';

const DEFAULT_COLOR = 'var(--color-text-idle)';

type Props = {
  name?: string;
  color?: string;
  size?: number;
  className?: string;
  hover?: boolean;
  hoverColor?: string;
};

const Icon: FunctionComponent<Props> = ({
  name = 'default',
  color = DEFAULT_COLOR,
  size = 30,
  className,
  hover = false,
  hoverColor,
}) => {
  const { d, width, group } = icons[name] || icons.default;

  // CSS tokens update live with the theme; explicit hex colors still support
  // the original derived hover tint.
  const vars = {
    '--icon-fill': color,
    '--icon-size': `${size}px`,
    ...(hover
      ? {
          '--icon-fill-hover':
            hoverColor ??
            (color.startsWith('#')
              ? getColorLuminance(color, 0.3)
              : 'var(--color-icon-hover)'),
        }
      : {}),
  } as CSSProperties;

  return (
    <svg
      style={vars}
      className={[styles.icon, hover ? styles.hoverable : '', className]
        .filter(Boolean)
        .join(' ')}
      x="0px"
      y="0px"
      viewBox={`0 0 ${width} 512`}
    >
      {group || <path d={d} />}
    </svg>
  );
};

export default Icon;
