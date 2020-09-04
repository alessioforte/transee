import React, { useState, FunctionComponent } from 'react';
import styled from 'styled-components';
import Icon from '../Icon';
import theme from '../../theme';

type Props = {
  label?: string;
  name?: string;
  value?: boolean;
  onChange?: (data) => void;
};

const Checkbox: FunctionComponent<Props> = ({
  label,
  name,
  value,
  onChange = () => null,
}) => {
  const [state, setState] = useState(value || false);

  const handleOnClick = (e) => {
    e.preventDefault();
    const newValue = !state;
    setState(newValue);

    const data = { value: newValue, label, name };
    onChange(data);
  };

  return (
    <Wrapper onClick={handleOnClick}>
      <input type="checkbox" name={name} value={state} />
      <Check
        role="checkbox"
        name={name}
        value={state}
        aria-label={label}
        aria-checked={state}
        tabIndex="0"
      >
        <Icon name="checkmark" size={9} color="#fff" />
      </Check>
      {label && <Label>{label}</Label>}
    </Wrapper>
  );
};

export default Checkbox;

const { colors } = theme;

const Wrapper = styled.label`
  display: inline-flex;
  width: fit-content;
  cursor: pointer;
  font-size: 1rem;
  & > input {
    position: absolute;
    opacity: 0;
    z-index: -1;
  }
`;
const Check = styled.span<{ value: boolean }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background: ${(props) => (props.value ? colors.primary : colors.groundzero)};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    opacity: 0.8;
  }
  &:focus {
    outline: none;
  }
  & svg {
    position: absolute;
    opacity: ${(props) => (props.value ? 1 : 0)};
  }
`;
const Label = styled.span`
  display: inline-block;
  margin-left: 5px;
`;
