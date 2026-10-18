import { FC, MouseEvent } from 'react';
import styles from './Toggle.module.css';

export type Data = {
  checked: boolean;
  label?: string;
  name?: string;
  value: boolean;
};

export type Props = {
  label?: string;
  name?: string;
  value?: boolean;
  onChange?: (data: Data, e: MouseEvent<HTMLDivElement>) => void;
};

/**
 * Controlled. The prop used to be `initialValue`, seeded into a `useState` that
 * never synced — so "Restore default settings" reset the store while the switch
 * stayed where the user had left it.
 */
const Toggle: FC<Props> = ({ label, value = false, name, onChange = () => null }) => {
  const handleOnClick = (e: MouseEvent<HTMLDivElement>): void => {
    const checked = !value;
    onChange({ name, value: checked, checked, label }, e);
  };

  return (
    <div className={styles.block}>
      <div
        className={styles.knob}
        data-checked={value}
        role="checkbox"
        aria-label={label}
        aria-checked={value}
        onClick={handleOnClick}
        tabIndex={0}
      />
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
};

export default Toggle;
