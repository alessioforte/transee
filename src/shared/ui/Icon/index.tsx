import { CSSProperties, FunctionComponent } from 'react';
import icons from './icons';
import { getColorLuminance } from '@/shared/color';
import styles from './Icon.module.css';

const DEFAULT_COLOR = '#444444'; // --color-text-idle

type Props = {
  name?: string;
  color?: string;
  size?: number;
  className?: string;
  hover?: boolean;
};

const Icon: FunctionComponent<Props> = ({
  name = 'default',
  color = DEFAULT_COLOR,
  size = 30,
  className,
  hover = false,
}) => {
  const { d, width, group } = icons[name] || icons.default;

  // The hover tint is derived from whatever colour the caller passed, so unlike
  // the other getColorLuminance sites it cannot be baked into tokens.css. It
  // rides in as a custom property instead.
  const vars = {
    '--icon-fill': color,
    '--icon-size': `${size}px`,
    ...(hover ? { '--icon-fill-hover': getColorLuminance(color, 0.3) } : {}),
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
