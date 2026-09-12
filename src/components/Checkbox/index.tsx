import { FunctionComponent, MouseEvent } from 'react';
import Icon from '../Icon';
import styles from './Checkbox.module.css';

export type Data = {
  value: boolean;
  label?: string;
  name?: string;
};

type Props = {
  label?: string;
  name?: string;
  value?: boolean;
  onChange?: (data: Data) => void;
};

/**
 * Controlled. It used to seed a `useState` from the `value` prop and never sync
 * again, so "Restore default settings" reset the store while the box kept
 * showing the old state.
 */
const Checkbox: FunctionComponent<Props> = ({
  label,
  name,
  value = false,
  onChange = () => null,
}) => {
  const handleOnClick = (e: MouseEvent<HTMLLabelElement>) => {
    // The wrapper is a <label> around a real checkbox; without this the native
    // toggle fires too and fights the controlled value.
    e.preventDefault();
    onChange({ value: !value, label, name });
  };

  return (
    <label className={styles.wrapper} onClick={handleOnClick}>
      <input type="checkbox" name={name} checked={value} readOnly />
      <span
        className={styles.check}
        data-checked={value}
        role="checkbox"
        aria-label={label}
        aria-checked={value}
        tabIndex={0}
      >
        <Icon name="checkmark" size={9} color="#fff" />
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};

export default Checkbox;
