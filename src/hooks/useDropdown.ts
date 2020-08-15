import { useState, RefObject } from 'react';

type Props = {
  dropdown: RefObject<HTMLElement>;
  onClose?: () => void;
};

type Returns = {
  show: () => void;
  blur: () => void;
  close: () => void;
  hide: (e: Event) => void;
  isOpen: boolean;
};

const useDropdown = ({
  dropdown,
  onClose = () => null,
}: Props): Returns => {
  const [isOpen, setIsOpen] = useState(false);

  const show = () => {
    if (!isOpen) {
      setIsOpen(true);
      document.addEventListener('click', hide);
      window.addEventListener('blur', blur);
    }
  };

  const blur = () => {
    setIsOpen(false);
    document.removeEventListener('click', hide);
    window.removeEventListener('blur', blur);
    onClose();
  };

  const hide = (e: Event) => {
    const node: Node | null = e.target as Node;
    if (dropdown.current && !dropdown.current.contains(node)) {
      setIsOpen(false);
    }
    if (!dropdown.current) {
      document.removeEventListener('click', hide);
      window.removeEventListener('blur', blur);
    }
    onClose();
  };

  const close = () => {
    setIsOpen(false);
    onClose();
    document.removeEventListener('click', hide);
    window.removeEventListener('blur', blur);
  };

  return { show, blur, close, hide, isOpen };
};

export default useDropdown;
