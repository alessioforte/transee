import React, {
  Children,
  useState,
  useRef,
  useEffect,
  FunctionComponent
} from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

let ROOT_ID = 'root-tooltip';

type Props = {
  children: React.ReactElement;
  content: string;
};

interface FC<P> extends FunctionComponent<P> {
  setRoot: (APP_NODE: Element, id: string) => void;
}

const Tooltip: FC<Props> = ({ content, children }) => {
  const target = useRef();
  const tip = useRef();

  const [visible, setState] = useState<boolean>(false);

  useEffect(() => {
    if (tip.current) {
      const rect = target.current.getBoundingClientRect();
      const { innerHeight, innerWidth, scrollY } = window;
      const { width, height } = tip.current.getBoundingClientRect();
      const right = innerWidth - (rect.x + rect.width);
      const position = {
        bottom: `${innerHeight - rect.top - scrollY + 5}px`,
        left: `${rect.left + rect.width / 2 - width / 2}px`
      };

      if (width / 2 > rect.x + rect.width / 2 && width > rect.width) {
        position.left = `${rect.left}px`;
      }

      if (right < width / 2) {
        position.left = `${innerWidth -
          (innerWidth - rect.x) -
          width +
          rect.width}px`;
      }

      if (rect.y < height) {
        position.bottom = `${innerHeight -
          rect.top -
          scrollY -
          height -
          rect.height -
          5}px`;
      }

      Object.assign(tip.current.style, position);
    }
  });

  const show = () => {
    setState(true);
  };

  const hide = () => {
    setState(false);
  };

  const renderTooltip = () => {
    const ROOT_NODE: any = document.getElementById(ROOT_ID);
    const Root = <Tip ref={tip}>{content}</Tip>;
    return createPortal(Root, ROOT_NODE);
  };

  return (
    <>
      <Target
        ref={target}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-haspopup='true'
      >
        {Children.toArray(children)}
      </Target>
      {visible && renderTooltip()}
    </>
  );
};

function setRoot(APP_NODE, id) {
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

export const delay = keyframes`
    0% {
        opacity: 0;
    }
    75% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
`;
export const Target = styled.div`
  display: inline-block;
  width: fit-content;
`;
export const Tip = styled.div`
  position: absolute;
  left: -800px;
  z-index: 99;
  padding: 9px;
  animation: 1.2s ${delay} ease;
  font-size: 12px;
  max-height: 150px;
  max-width: 300px;
  box-sizing: border-box;
  text-align: center;
  background: #1a1a1a;
  color: white;
  box-shadow: 0px 1px 5px 1px rgba(0, 0, 0, 0.2);
  border-radius: 3px;
`;
