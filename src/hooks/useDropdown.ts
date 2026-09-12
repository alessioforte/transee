import { useState, useEffect, RefObject } from 'react';

type Props = {
  dropdown: RefObject<HTMLElement>;
  onClose?: () => void;
};

type Returns = {
  show: () => void;
  close: () => void;
  isOpen: boolean;
};

const useDropdown = ({
  // dropdown,
  onClose = () => null,
}: Props): Returns => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      window.removeEventListener('click', close);
      window.removeEventListener('blur', close);
    }
  }, [isOpen])

  const show = () => {
    if (!isOpen) {
      setIsOpen(true);
      window.addEventListener('click', close);
      window.addEventListener('blur', close);
    }
  };

  // const hide = (e: Event) => {
  //   const node: Node | null = e.target as Node;
  //   if (dropdown.current && !dropdown.current.contains(node)) {
  //     close()
  //   }
  // }

  const close = () => {
    setIsOpen(false);
    onClose();
  };

  return { show, close, isOpen };
};

export default useDropdown;
