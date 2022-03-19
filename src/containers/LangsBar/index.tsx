import React, {
  useState,
  useEffect,
  FunctionComponent,
  useRef,
  MutableRefObject,
} from 'react';
import { Icon } from '../../components';
import styled from 'styled-components';
import { Props, Option, Conversion, Target, Values } from './interfaces';
import { selectLangs, invertLangs } from './actions';
import { useDropdown } from '../../hooks';
import theme, { getColorLuminance } from '../../theme';

const defaultValues: Values = {
  threesome: {
    from: [
      { value: 'en', label: 'English' },
      { value: 'it', label: 'Italian' },
      { value: 'es', label: 'Spanish' },
    ],
    to: [
      { value: 'it', label: 'Italian' },
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
    ],
  },
  selected: { from: 'en', to: 'it' },
};

const LangsBar: FunctionComponent<Props> = ({
  options = { from: [], to: [] },
  values = defaultValues,
  onChange = () => null,
  onToggleDropdown = () => null,
}: Props) => {
  const dropdown: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const { selected, threesome } = values;
  const [side, setSide] = useState(Conversion.from);
  const { isOpen, show, close } = useDropdown({ dropdown });

  useEffect(() => {
    onToggleDropdown(isOpen);
  }, [isOpen]);

  const select = (target: Target, opt: Option) => {
    const data = selectLangs(values, target, opt);
    onChange(data);
    close();
  };

  const invert = () => {
    const data = invertLangs(values);
    onChange(data);
  };

  const showDropdown = (conversion: Conversion) => {
    show();
    setSide(conversion);
  };

  return (
    <>
      <Bar>
        <From>
          <Caret
            onClick={() => showDropdown(Conversion.from)}
            isOpen={isOpen && side === Conversion.from}
            position="left"
          >
            <Icon name="caret" size={5} color={colors.idle} hover />
          </Caret>
          {threesome.from.map((opt: Option) => (
            <Lang
              key={opt.value}
              value={opt.value}
              active={opt.value === selected.from}
              disabled={opt.value === selected.from}
              onClick={() => select(Conversion.from, opt)}
            >
              {opt.label}
            </Lang>
          ))}
        </From>

        <Invert onClick={invert}>
          <Icon name="translate" size={14} color={colors.idle} hover />
        </Invert>

        <To>
          {threesome.to.map((opt: Option) => (
            <Lang
              key={opt.value}
              value={opt.value}
              active={opt.value === selected.to}
              disabled={opt.value === selected.to}
              onClick={() => select(Conversion.to, opt)}
            >
              {opt.label}
            </Lang>
          ))}
          <Caret
            onClick={() => showDropdown(Conversion.to)}
            isOpen={isOpen && side === Conversion.to}
            position="right"
          >
            <Icon name="caret" size={5} color={colors.idle} hover />
          </Caret>
        </To>
      </Bar>
      {isOpen && (
        <Dropdown ref={dropdown}>
          <List>
            {options[side].map((item: Option) => (
              <Item
                key={item.value}
                inBar={threesome[side].some(
                  (l: Option) => l.value === item.value
                )}
                active={item.value === selected[side]}
                onClick={() => select(side, item)}
              >
                {item.label}
              </Item>
            ))}
          </List>
        </Dropdown>
      )}
    </>
  );
};

export default LangsBar;

const { colors } = theme;

const Invert = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  height: 100%;
  -webkit-app-region: no-drag;
`;
const Caret = styled.div<{ isOpen: boolean; position: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  width: 40px;
  transition: all 0.3s ease-out;
  -webkit-app-region: no-drag;
  ${(props) =>
    props.isOpen &&
    `
    ${
      props.position === 'left'
        ? 'transform:rotate(-180deg);'
        : 'transform:rotate(180deg);'
    }
  `}
`;
const Bar = styled.div`
  display: flex;
  height: 25px;
  justify-content: space-between;
  background: ${theme.colors.frame};
  user-select: none;
  -webkit-app-region: drag;
`;
const Threesome = styled.div`
  width: 330px;
  display: flex;
`;
const From = styled(Threesome)``;
const To = styled(Threesome)`
  justify-content: flex-end;
`;
const Lang = styled.button<{ active: boolean }>`
  -webkit-app-region: no-drag;
  font-size: 12px;
  box-sizing: border-box;
  padding: 6px 9px;
  background: none;
  border: 0;
  text-align: center;
  cursor: default;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${(props) => (props.active ? colors.text.main : colors.text.low)};
  &:hover {
    color: ${(props) =>
      props.active ? colors.text.main : getColorLuminance(colors.text.low, 0.5)};
  }
  &:focus {
    outline: none;
  }
`;
const Dropdown = styled.div`
  width: 100%;
  transition: all 0.9s ease-out;
`;
const List = styled.div`
  padding: 9px;
  columns: 5;
  column-gap: 0;
`;
const Item = styled.div<{ active: boolean; inBar: boolean }>`
  box-sizing: border-box;
  padding: 3px 0 3px 12px;
  font-size: 12px;
  height: 20px;
  color: ${colors.text.low};
  ${(props) =>
    props.inBar &&
    `
    background: ${colors.hover};
  `}
  ${(props) =>
    props.active &&
    `
    background: ${colors.hover};
    color: ${colors.text.main};
  `}
  cursor: default;
  &:hover {
    background: ${colors.hover};
    color: ${colors.text.main};
  }
`;
