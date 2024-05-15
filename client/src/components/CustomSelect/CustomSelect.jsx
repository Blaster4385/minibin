import React, { useEffect, useState, useRef } from "react";
import { SUPPORTED_LANGUAGES } from "../../utils/constants";

import styles from "./CustomSelect.module.css";

const CustomSelect = ({ onSelect, textAreaRef, isModalOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(SUPPORTED_LANGUAGES);
  const [selectedOption, setSelectedOption] = useState(
    options.length > 0 ? options[0] : null,
  );
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);
  const selectRef = useRef(null);
  const searchRef = useRef(null);
  const optionsRef = useRef([]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option, index) => {
    setSelectedOption(option);
    onSelect(option.value);
    setFocusedOptionIndex(index);
    setIsOpen(false);
    setOptions(SUPPORTED_LANGUAGES);
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  };

  const handleClickOutside = (event) => {
    if (selectRef.current && !selectRef.current.contains(event.target)) {
      setIsOpen(false);
      setOptions(SUPPORTED_LANGUAGES);

      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }
  };

  const handleChange = (e) => {
    const searchVal = e.target.value;
    const filteredOptions =
      searchVal.length > 0
        ? SUPPORTED_LANGUAGES.filter((option) =>
            option.label.toLowerCase().includes(searchVal.toLowerCase()),
          )
        : SUPPORTED_LANGUAGES;

    setOptions(filteredOptions);
    setFocusedOptionIndex(0);
  };

  const handleKeyDown = (event) => {
    if (isOpen) {
      switch (event.key) {
        case "ArrowDown":
          setFocusedOptionIndex((prevIndex) => {
            const newIndex =
              prevIndex < options.length - 1 ? prevIndex + 1 : prevIndex;
            optionsRef.current[newIndex].scrollIntoView({ block: "nearest" });
            return newIndex;
          });
          break;
        case "ArrowUp":
          setFocusedOptionIndex((prevIndex) => {
            const newIndex = prevIndex > 0 ? prevIndex - 1 : prevIndex;
            optionsRef.current[newIndex].scrollIntoView({ block: "nearest" });
            return newIndex;
          });
          break;
        case "Enter":
          event.preventDefault();
          handleOptionClick(options[focusedOptionIndex], focusedOptionIndex);
          break;
        case "Escape":
          setIsOpen(false);
          setOptions(SUPPORTED_LANGUAGES);
          if (textAreaRef.current) {
            textAreaRef.current.focus();
          }
          break;
        default:
          break;
      }
    } else if (!isModalOpen && event.ctrlKey && event.key === "l") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, options, focusedOptionIndex]);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

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
          <input
            onChange={handleChange}
            className={styles.options__search}
            ref={searchRef}
            placeholder="Search..."
          />
          <div className={styles.options}>
            {options.map((option, index) => (
              <div
                key={option.value}
                className={`${styles.option} ${index === focusedOptionIndex ? styles.focused : ""}`}
                onClick={() => handleOptionClick(option, index)}
                tabIndex={0}
                ref={(el) => (optionsRef.current[index] = el)}
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
