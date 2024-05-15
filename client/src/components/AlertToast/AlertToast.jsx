import React, { useEffect } from "react";
import styles from "./AlertToast.module.css";

const AlertToast = ({ openAlertToast, setOpenAlertToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenAlertToast(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [openAlertToast, setOpenAlertToast]);

  return (
    <div
      className={`${styles.background} ${openAlertToast ? styles.active : ""}`}
    >
      <div className={styles.container}>
        <p className={styles.container__title}>Please enter some text!</p>
      </div>
    </div>
  );
};

export default AlertToast;
