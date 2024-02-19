import React from "react";
import { SUPPORTED_LANGUAGES } from "../../utils/constants";
import styles from "./Header.module.css";
import CustomSelect from "../CustomSelect/CustomSelect";

const Header = ({ isSelectVisible, onLanguageChange }) => {
  return (
    <div className={styles.header}>
      <h1>minibin</h1>
      {isSelectVisible && (
        <CustomSelect
          options={SUPPORTED_LANGUAGES}
          onSelect={onLanguageChange}
        />
      )}
    </div>
  );
};

export default Header;
