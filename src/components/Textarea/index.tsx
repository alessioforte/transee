import { FC, ReactElement } from 'react';
import { Spinner } from '..';
import field from '@/shared/styles/field.module.css';
import styles from './Textarea.module.css';

export type Props = {
  loading?: boolean;
  name?: string;
  value?: string;
  description?: string;
  delay?: number;
  isError?: boolean;
  message?: string;
  renderIcons?: () => ReactElement | null;
};

const Textarea: FC<Props> = ({
  loading = false,
  value = '',
  description,
  isError = false,
  message = 'error',
  renderIcons,
}) => {
  return (
    <>
      <div className={field.container}>
        <div className={styles.text}>
          <span>{value}</span>
          {description && <span className={styles.description}>{description}</span>}
        </div>
        {loading && (
          <div className={field.loading}>
            <Spinner />
          </div>
        )}
        {renderIcons && <div className={field.icons}>{renderIcons()}</div>}
      </div>
      {isError && <div className={field.message}>{message}</div>}
    </>
  );
};

export default Textarea;
