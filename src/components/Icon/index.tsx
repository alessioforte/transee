import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import icons from './icons';

type Props = {
  name?: string;
  color?: string;
  size?: number;
  className?: string;
};

const Icon: FunctionComponent<Props> = ({
  name = 'default',
  color = '#444',
  size = 30,
  className,
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
    >
      {group || <path d={d} />}
    </Svg>
  );
};

export default Icon;

const Svg = styled.svg<{ color: string; size: number }>`
  fill: ${(props) => props.color};
  height: ${(props) => props.size + 'px'};
  &:hover path {
    fill: #999;
  }
  &:active path {
    fill: #eee;
  }
`;
