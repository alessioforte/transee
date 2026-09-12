import { FunctionComponent, ReactElement } from 'react';
import styles from './Card.module.css';

type Props = {
  title?: string;
  renderHeader?: () => ReactElement;
  children?: ReactElement | ReactElement[] | string;
};

const Card: FunctionComponent<Props> = ({ title = '', renderHeader, children }) => {
  const body = children || <></>;
  const header = renderHeader ? renderHeader() : title;

  return (
    <div className={styles.box}>
      <div className={styles.header}>{header}</div>
      <div className={styles.body}>{body}</div>
    </div>
  );
};

export default Card;
