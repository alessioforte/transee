import { useState, useEffect, useRef } from 'react';

type Props = {
  onClose?: () => void;
};

type Returns = {
  show: () => void;
  close: () => void;
  isOpen: boolean;
};

/**
 * Open/closed state for a dropdown, dismissed by any click or by the window
 * losing focus.
 *
 * The listeners are owned by an effect now. They used to be added in `show()`
 * and removed in an effect, but the handler was re-created on every render — so
 * `removeEventListener` was always passed a different function identity than
 * the one that had been registered, and the listeners accumulated.
 *
 * NOTE: dismissal is global, not outside-click. The hook used to accept a
 * `dropdown` ref implying otherwise while ignoring it, which is why callers
 * still need `stopPropagation()` on the control that opens the dropdown.
 */
const useDropdown = ({ onClose = () => null }: Props = {}): Returns => {
  const [isOpen, setIsOpen] = useState(false);

  // Kept in a ref so a caller passing an inline arrow does not re-subscribe.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const dismiss = () => {
      setIsOpen(false);
      onCloseRef.current();
    };

    window.addEventListener('click', dismiss);
    window.addEventListener('blur', dismiss);
    return () => {
      window.removeEventListener('click', dismiss);
      window.removeEventListener('blur', dismiss);
    };
  }, [isOpen]);

  const show = () => setIsOpen(true);
  const close = () => {
    setIsOpen(false);
    onCloseRef.current();
  };

  return { show, close, isOpen };
};

export default useDropdown;
