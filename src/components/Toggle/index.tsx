import React, { FC, useState } from 'react';
import styled from 'styled-components';
import theme from '../../theme';

export type Data = {
  checked: boolean;
  label?: string;
  name?: string;
  value: boolean;
};

export type Props = {
  label?: string;
  name?: string;
  initialValue?: boolean;
  onChange?: (
    data: Data,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
};

export type KnobProps = {
  active: boolean;
  name?: string;
  value: boolean;
};

const Toggle: FC<Props> = ({
  label,
  initialValue,
  name,
  onChange = () => null,
}) => {
  const [value, setValue] = useState<boolean>(initialValue || false);

  const handleOnClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    const checked = !value;
    setValue(checked);
    const data: Data = { name, value: checked, checked, label };
    onChange(data, e);
  };

  return (
    <Block>
      <Knob
        role="checkbox"
        name={name}
        value={value}
        aria-label={label}
        aria-checked={value}
        onClick={handleOnClick}
        active={value}
        tabIndex={0}
      ></Knob>
      {label && <Label>{label}</Label>}
    </Block>
  );
};

export default Toggle;

const { colors } = theme;

export const Block = styled.div`
  display: inline-block;
`;
export const Knob = styled.div<KnobProps>`
  flex-shrink: 0;
  position: relative;
  height: 20px;
  width: 40px;
  border-radius: 20px;
  position: relative;
  background: ${colors.groundzero};
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    opacity: 0.8;
  }
  &:focus {
    outline: none;
  }
  &:after {
    content: '';
    height: 16px;
    width: 16px;
    background: ${(props) => (props.active ? colors.primary : colors.foreground)};
    left: ${(props) => (props.active ? '20px' : '0')};
    border-radius: 50%;
    position: absolute;
    margin: 2px;
    transition: all 0.3s ease;
  }
`;
export const Label = styled.div`
  display: inline-block;
  margin-left: 5px;
`;
