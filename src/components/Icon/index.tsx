import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import icons from './icons';
import theme, { getColorLuminance } from '../../theme';

type Props = {
  name?: string;
  color?: string;
  size?: number;
  className?: string;
  hover?: boolean;
};

const Icon: FunctionComponent<Props> = ({
  name = 'default',
  color = colors.text.idle,
  size = 30,
  className,
  hover = false,
}) => {
  const { d, width, group } = icons[name] || icons.default;

  return (
    <Svg
      color={color}
      size={size}
      className={className}
      x="0px"
      y="0px"
      viewBox={`0 0 ${width} 512`}
      hover={hover}
    >
      {group || <path d={d} />}
    </Svg>
  );
};

export default Icon;

const { colors } = theme;

const Svg = styled.svg<{ color: string; size: number, hover: boolean }>`
  fill: ${(props) => props.color || colors.text.soft};
  height: ${(props) => props.size + 'px'};
  ${props => props.hover && `
    &:hover path {
      fill: ${getColorLuminance(props.color || colors.text.soft, 0.3)};
    }
    &:active path {
      fill: ${colors.text.main};
    }
  `}
`;
