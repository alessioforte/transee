import {
  Children,
  useState,
  useRef,
  useEffect,
  FunctionComponent,
  ReactElement,
} from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

let ROOT_ID = 'root-tooltip';

type Props = {
  children: ReactElement;
  content: string;
};

interface FC<P> extends FunctionComponent<P> {
  setRoot: (APP_NODE: Element, id: string) => void;
}

const Tooltip: FC<Props> = ({ content, children }) => {
  const target = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);

  const [visible, setState] = useState<boolean>(false);

  // Only needs to run when the tip appears or its text changes. It used to have
  // no dependency array at all, so every render of any ancestor triggered a
  // getBoundingClientRect + inline style write.
  useEffect(() => {
    if (!tip.current || !target.current) return;

    const rect = target.current.getBoundingClientRect();
    const { innerHeight, innerWidth, scrollY } = window;
    const { width, height } = tip.current.getBoundingClientRect();
    const right = innerWidth - (rect.x + rect.width);
    const position = {
      bottom: `${innerHeight - rect.top - scrollY + 5}px`,
      left: `${rect.left + rect.width / 2 - width / 2}px`,
    };

    if (width / 2 > rect.x + rect.width / 2 && width > rect.width) {
      position.left = `${rect.left}px`;
    }

    if (right < width / 2) {
      position.left = `${innerWidth - (innerWidth - rect.x) - width + rect.width}px`;
    }

    if (rect.y < height) {
      position.bottom = `${
        innerHeight - rect.top - scrollY - height - rect.height - 5
      }px`;
    }

    Object.assign(tip.current.style, position);
  }, [visible, content]);

  const show = () => setState(true);
  const hide = () => setState(false);

  const renderTooltip = () => {
    const ROOT_NODE = document.getElementById(ROOT_ID);
    if (!ROOT_NODE) return null;
    return createPortal(
      <div ref={tip} className={styles.tip}>
        {content}
      </div>,
      ROOT_NODE
    );
  };

  return (
    <>
      <div
        ref={target}
        className={styles.target}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-haspopup="true"
      >
        {Children.toArray(children)}
      </div>
      {visible && renderTooltip()}
    </>
  );
};

function setRoot(APP_NODE: Element, id: string) {
  ROOT_ID = id;
  let node = document.getElementById(ROOT_ID);
  if (!node) {
    node = document.createElement('div');
    node.setAttribute('id', ROOT_ID);
    APP_NODE.insertAdjacentElement('afterend', node);
  }
}

Tooltip.setRoot = setRoot;

export default Tooltip;
