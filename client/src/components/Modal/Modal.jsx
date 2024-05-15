import React, { useRef, useEffect } from "react";
import styles from "./Modal.module.css";

const Modal = ({
  openModal,
  setOpenModal,
  onSuccessClick,
  onCancelClick,
  textAreaRef,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModal(false);
        if (textAreaRef.current) {
          setTimeout(() => {
            textAreaRef.current.focus();
          }, 0);
        }
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenModal(false);
        if (textAreaRef.current) {
          setTimeout(() => {
            textAreaRef.current.focus();
          }, 0);
        }
      } else if (
        (event.key.toLowerCase() === "y" ||
          event.key.toLowerCase() === "enter") &&
        openModal
      ) {
        onSuccessClick();
        event.preventDefault();
        setOpenModal(false);
      } else if (event.key.toLowerCase() === "n" && openModal) {
        onCancelClick();
        setOpenModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openModal]);

  return (
    openModal && (
      <div className={`${styles.background} ${openModal && styles.active}`}>
        <div ref={modalRef} className={styles.container}>
          <button
            className={styles.container__close}
            onClick={() => setOpenModal(false)}
          >
            <span>&#10007;</span>
          </button>
          <p className={styles.container__title}>
            Encrypt content?{" "}
            <span className={styles.container__title__span}>[Y/n]</span>
          </p>
          <div className={styles.container__actions}>
            <button onClick={onSuccessClick}>Yes</button>
            <button onClick={onCancelClick}>No</button>
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
