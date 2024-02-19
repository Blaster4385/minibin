import React, { useState } from "react";
import styles from "./CustomSelect.module.css";

const CustomSelect = ({ options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.length > 0 ? options[0] : null
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <div className={styles.select}>
      <div className={styles.selected__option} onClick={toggleDropdown}>
        {selectedOption ? (
          <>
            <span>&#x3c;&#x2f;&#x3e;</span>
            <span>{selectedOption.label}</span>
            <span>&#9660;</span>
          </>
        ) : (
          "Select an option"
        )}
      </div>
      {isOpen && (
        <div className={styles.options}>
          {options.map((option) => (
            <div
              key={option.value}
              className={styles.option}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
