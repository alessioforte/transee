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
  'aria-label'?: string;
  'aria-labelledby'?: string;
  onChange?: (data: Data, e: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Controlled. The prop used to be `initialValue`, seeded into a `useState` that
 * never synced — so "Restore default settings" reset the store while the switch
 * stayed where the user had left it.
 */
const Toggle: FC<Props> = ({
  label,
  value = false,
  name,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  onChange = () => null,
}) => {
  const handleOnClick = (e: MouseEvent<HTMLButtonElement>): void => {
    const checked = !value;
    onChange({ name, value: checked, checked, label }, e);
  };

  return (
    <div className={styles.block}>
      <button
        type="button"
        name={name}
        className={styles.knob}
        data-checked={value}
        role="switch"
        aria-label={ariaLabel ?? label}
        aria-labelledby={ariaLabelledBy}
        aria-checked={value}
        onClick={handleOnClick}
      />
      {label && <div className={styles.label}>{label}</div>}
    </div>
  );
};

export default Toggle;
