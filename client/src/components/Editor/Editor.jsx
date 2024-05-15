import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Prism from "prismjs";
import styles from "./Editor.module.css";
import "../prism-themes/prism-gruvbox-dark.css";
import "../prism-themes/prism-line-numbers.css";
import { URL_REGEX } from "../../utils/constants";
import Header from "../Header/Header";
import {
  generateAESKey,
  keyToString,
  stringToKey,
  encryptAES,
  decryptAES,
} from "../../utils/encryption";
import Modal from "../Modal/Modal";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("none");
  const [openModal, setOpenModal] = useState(false);
  const textareaRef = useRef(null);
  const lineNumberRef = useRef(null);
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const origin = useMemo(() => window.location.origin, []);

  const handleTextChange = useCallback((event) => {
    setText(event.target.value);
  }, []);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleSaveClick = useCallback(async () => {
    if (!text) {
      alert("Please enter some text!");
      return;
    }
    if (URL_REGEX.test(text)) {
      const response = await fetch(`${origin}/bin`, {
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
        const shortURL = `${origin}/r/${data.id}`;
        copyToClipboard(shortURL);
        alert("Short URL copied to clipboard!");
        navigate(`/${data.id}`);
      } else {
        console.error(data);
      }
    } else {
      setOpenModal(true);
    }
  }, [text, language, navigate]);

  const handleSuccessClick = useCallback(async () => {
    setOpenModal(false);
    const key = await generateAESKey();
    const keyString = await keyToString(key);
    const { encrypted, iv } = await encryptAES(text, key);
    const encryptedBase64 = btoa(
      String.fromCharCode.apply(null, new Uint8Array(encrypted)),
    );
    const ivBase64 = btoa(String.fromCharCode.apply(null, iv));

    const response = await fetch(`${origin}/bin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        content: encryptedBase64,
        iv: ivBase64,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      const encryptedURL = `${origin}/${data.id}?key=${keyString}`;
      copyToClipboard(encryptedURL);
      alert("URL copied to clipboard!");
      navigate(`/${data.id}?key=${keyString}`);
    } else {
      console.error(data);
    }
  }, [text, language, navigate]);

  const handleCancelClick = useCallback(async () => {
    setOpenModal(false);
    const response = await fetch(`${origin}/bin`, {
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
      const normalURL = `${origin}/${data.id}`;
      copyToClipboard(normalURL);
      alert("URL copied to clipboard!");
      navigate(`/${data.id}`);
    } else {
      console.error(data);
    }
  }, [text, language, navigate]);

  const handleLanguageChange = useCallback((value) => {
    setLanguage(value);
  }, []);

  useEffect(() => {
    Prism.highlightAll();
  }, [text, language]);

  const fetchData = useCallback(async () => {
    const response = await fetch(`${origin}/bin/${id}`);
    const data = await response.json();
    if (response.ok) {
      if (data.iv) {
        const keyString = queryParams.get("key");
        const key = await stringToKey(keyString);
        const encrypted = new Uint8Array(
          atob(data.content)
            .split("")
            .map((char) => char.charCodeAt(0)),
        ).buffer;
        const ivArray = new Uint8Array(
          atob(data.iv)
            .split("")
            .map((char) => char.charCodeAt(0)),
        );
        const decryptedContent = await decryptAES(encrypted, key, ivArray);
        setLanguage(data.language);
        setText(decryptedContent);
      } else {
        const isURL = URL_REGEX.test(data.content);
        if (isURL) {
          setText(`Your shortened URL: ${origin}/r/${id}`);
        } else {
          setLanguage(data.language);
          setText(data.content);
        }
      }
    }
  }, [id, queryParams]);

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      setText("");
    }
  }, [id, fetchData]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).catch(() => {
      try {
        document.execCommand("copy");
      } catch (err) {
        console.log("Oops, unable to copy");
      }
    });
  }, []);

  return (
    <>
      <Header isSelectVisible={!id} onLanguageChange={handleLanguageChange} />
      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onSuccessClick={handleSuccessClick}
        onCancelClick={handleCancelClick}
      />
      <div className={styles.container}>
        {!id && (
          <button className={styles.btn__save} onClick={handleSaveClick}>
            <img
              src="assets/icons/save.svg"
              className={styles.btn__icon}
              alt="Save"
            />
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
              value={text}
            />
            <pre className="line-numbers" ref={lineNumberRef}>
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
