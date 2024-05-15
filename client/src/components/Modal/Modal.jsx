import React, { useRef, useEffect } from "react";
import styles from "./Modal.module.css";

const Modal = ({ openModal, setOpenModal, onSuccessClick, onCancelClick }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpenModal]);

  return (
    <div className={`${styles.background} ${openModal && styles.active}`}>
      <div ref={modalRef} className={styles.container}>
        <button
          className={styles.container__close}
          onClick={() => setOpenModal(false)}
        >
          <span>&#10007;</span>
        </button>
        <p className={styles.container__title}>Encrypt content?</p>
        <div className={styles.container__actions}>
          <button onClick={onSuccessClick}>Yes</button>
          <button onClick={onCancelClick}>No</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
