import React, { useRef, useState, useEffect } from "react";
import styles from "./ToolTip.module.css";

const ToolTip = ({ isOpen, setIsOpen, textAreaRef }) => {
  const toolTipRef = useRef(null);

  const handleClickOutside = (event) => {
    if (toolTipRef.current && !toolTipRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (event) => {
    if (
      isOpen &&
      (event.key === "Escape" ||
        (event.ctrlKey && (event.key === "k" || event.key === "l")))
    ) {
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
      <div ref={toolTipRef} className={`${styles.container} ${styles.active}`}>
        <img
          className={styles.container__triangle}
          src="/assets/icons/triangle.png"
        />
        <div className={styles.container__content}>
          <p className={styles.container__title}>Keyboard Shortcuts</p>
          <p className={styles.container__text}>
            Press <span className={styles.container__key}>Ctrl+K</span> to view
            keyboard shortcuts.
          </p>
          <span
            className={styles.container__btn}
            onClick={() => setIsOpen(false)}
          >
            Close
          </span>
        </div>
      </div>
    )
  );
};

export default ToolTip;
