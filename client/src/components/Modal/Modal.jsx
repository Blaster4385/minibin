import React from "react";
import styles from "./Modal.module.css";

const Modal = ({ openModal, setOpenModal, onSuccessClick, onCancelClick }) => {
  return (
    <div className={`${styles.background} ${openModal && styles.active}`}>
      <div className={styles.container}>
        <button
          className={styles.container__close}
          onClick={() => setOpenModal(false)}
        >
          <img src="assets/icons/ic_close.png" className={styles.close__img} />
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

