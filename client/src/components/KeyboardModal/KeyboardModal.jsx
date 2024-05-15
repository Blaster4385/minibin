import React, { useRef, useState, useEffect } from "react";
import styles from "./KeyboardModal.module.css";

const KeyboardModal = ({ textAreaRef, isOpen, setIsOpen, isModalOpen }) => {
  const keyboardModalRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      keyboardModalRef.current &&
      !keyboardModalRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event) => {
    if (!isModalOpen && event.ctrlKey && event.key === "k") {
      event.preventDefault();
      if (textAreaRef.current) {
        textAreaRef.current.blur();
      }
      setIsOpen(true);
    } else if (isOpen && event.key === "Escape") {
      setIsOpen(false);
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    isOpen && (
      <div className={`${styles.background} ${styles.active}`}>
        <div ref={keyboardModalRef} className={styles.container}>
          <button
            className={styles.container__close}
            onClick={() => setIsOpen(false)}
          >
            <span>&#10007;</span>
          </button>
          <p className={styles.container__title}>Keyboard Shortcuts</p>
          <div className={styles.container__shortcuts}>
            <p>
              <span className={styles.container__shortcut__key}>Ctrl + K</span>
              Open Keyboard Shortcuts
            </p>
            <p>
              <span className={styles.container__shortcut__key}>Ctrl + L</span>
              Open Language Selector
            </p>
            <p>
              <span className={styles.container__shortcut__key}>Ctrl + S</span>
              Save Bin
            </p>
          </div>
        </div>
      </div>
    )
  );
};

export default KeyboardModal;
