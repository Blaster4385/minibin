import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Prism from "prismjs";
import styles from "./Editor.module.css";
import "../prism-themes/prism-gruvbox-dark.css";
import { SERVER_BASE_URL, SUPPORTED_LANGUAGES } from "../../utils/constants";

const Editor = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("js");
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

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [text, language]);

  useEffect(() => {
    if (params.id) fetchData();
    else {
      textareaRef.current.value = "";
      setText("");
    }
  }, [params.id]);

  const fetchData = async () => {
    const response = await fetch(`${SERVER_BASE_URL}/bin/${params.id}`);
    const data = await response.json();
    if (response.ok) {
      setLanguage(data.language);
      setText(data.content);
    }
  };

  const lines = text.split("\n");

  return (
    <div className={styles.container}>
      {!params.id && (
        <>
          <select
            className={styles.languages}
            onChange={(event) => handleLanguageChange(event)}
          >
            {Object.keys(SUPPORTED_LANGUAGES).map((language) => (
              <option
                className={styles.languages__option}
                key={language}
                value={language}
              >
                {SUPPORTED_LANGUAGES[language]}
              </option>
            ))}
          </select>
          <button className={styles.btn__save} onClick={() => handleClick()}>
            <img src="assets/icons/save.svg" className={styles.btn__icon} />
          </button>
        </>
      )}

      <div className={styles.editor}>
        <div
          className={styles.line__numbers}
          ref={lineNumberRef}
          onScroll={handleScroll}
        >
          {lines.map((_, index) => (
            <div key={index + 1} className={styles.line__number}>
              {index + 1}
            </div>
          ))}
        </div>
        <div className={styles.codespace}>
          <textarea
            className={styles.codespace__textarea}
            onChange={handleTextChange}
            onScroll={handleScroll}
            hidden={params.id ? true : false}
            spellCheck="false"
            ref={textareaRef}
            placeholder="Type your text here..."
          />
          <pre className={styles.codespace__pre}>
            <code className={`${styles.codespace__code} language-${language}`}>
              {text}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Editor;
