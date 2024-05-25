import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import CustomSelect from "../CustomSelect/CustomSelect";

const Header = ({ isSelectVisible, onLanguageChange }) => {
  return (
    <div className={styles.header}>
      <Link to="/">
        <h1>
          <span className={styles.header__mini}>mini</span>bin
        </h1>
      </Link>
      {isSelectVisible && (
        <CustomSelect
          onSelect={onLanguageChange}
        />
      )}
    </div>
  );
};

export default Header;
