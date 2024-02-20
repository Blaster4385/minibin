import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Prism from "prismjs";
import styles from "./Editor.module.css";
import "../prism-themes/prism-gruvbox-dark.css";
import "../prism-themes/prism-line-numbers.css";
import {
  CLIENT_BASE_URL,
  SERVER_BASE_URL,
  URL_REGEX,
} from "../../utils/constants";
import Header from "../Header/Header";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("none");
  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleClick = async () => {
    if (!text) {
      alert("Please enter some text!");
      return;
    }
    const response = await fetch(`${SERVER_BASE_URL}/bin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        content: text,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      navigate(`/${data.id}`);
    } else {
      console.error(data);
    }
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [text, language]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${SERVER_BASE_URL}/bin/${id}`);
      const data = await response.json();
      if (response.ok) {
        const isURL = URL_REGEX.test(data.content);
        if (isURL) {
          setText(`Your shortened URL: ${CLIENT_BASE_URL}/r/${id}`);
          if (location.pathname === `/r/${id}`) {
            window.location.href = data.content;
          }
        } else {
          setLanguage(data.language);
          setText(data.content);
        }
      }
    };

    if (id) {
      fetchData();
    } else {
      textareaRef.current.value = "";
      setText("");
    }
  }, [id]);

  return (
    <>
      <Header isSelectVisible={!id} onLanguageChange={handleLanguageChange} />
      <div className={styles.container}>
        {!id && (
          <button className={styles.btn__save} onClick={handleClick}>
            <img src="assets/icons/save.svg" className={styles.btn__icon} />
          </button>
        )}

        <div className={styles.editor}>
          <div className={styles.codespace}>
            <textarea
              className={styles.codespace__textarea}
              onChange={handleTextChange}
              onScroll={handleScroll}
              style={{ display: id ? "none" : "block" }}
              spellCheck="false"
              ref={textareaRef}
              placeholder="</> Paste, save, share! (Pasting just a URL will shorten it!)"
            />
            <pre className="line-numbers">
              <code
                className={`${styles.codespace__code} language-${language}`}
              >
                {text + "\n"}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editor;
