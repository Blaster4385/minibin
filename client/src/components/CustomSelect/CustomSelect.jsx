import React, { useEffect, useState, useRef } from "react";
import { SUPPORTED_LANGUAGES } from "../../utils/constants";

import styles from "./CustomSelect.module.css";

const CustomSelect = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const  [options, setOptions] = useState(SUPPORTED_LANGUAGES)
  const [selectedOption, setSelectedOption] = useState(
    options.length > 0 ? options[0] : null,
  );
  const selectRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onSelect(option.value);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleChange = (e) => {
    const searchVal = e.target.value;
    searchVal.length > 0 ?
      setOptions(SUPPORTED_LANGUAGES.filter(option => option.label.toLowerCase().includes(searchVal.toLowerCase())))
      : setOptions(SUPPORTED_LANGUAGES)
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.select} ref={selectRef}>
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
        <div className={styles.options__container}>
          <input onChange={handleChange} className={styles.options__search} placeholder="Search..." />
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
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
