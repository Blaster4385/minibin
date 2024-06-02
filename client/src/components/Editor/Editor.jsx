import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Prism from "prismjs";
import styles from "./Editor.module.css";
import "../prism-themes/prism-gruvbox-dark.css";
import "../prism-themes/prism-line-numbers.css";
import { URL_REGEX } from "../../utils/constants";
import {
  generateAESKey,
  keyToString,
  stringToKey,
  encryptAES,
  decryptAES,
} from "../../utils/encryption";
import Modal from "../Modal/Modal";
import AlertToast from "../AlertToast/AlertToast";
import CustomSelect from "../CustomSelect/CustomSelect";
import KeyboardModal from "../KeyboardModal/KeyboardModal";
import ToolTip from "../ToolTip/ToolTip";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("none");
  const [openModal, setOpenModal] = useState(false);
  const [openKeyboardModal, setOpenKeyboardModal] = useState(false);
  const [openAlertToast, setOpenAlertToast] = useState(false);
  const [isToolTipShown, setIsToolTipShown] = useState(false);
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
      setOpenAlertToast(true);
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

  useEffect(() => {
    const isToolTipShown = localStorage.getItem("isToolTipShown");
    if (!isToolTipShown) {
      localStorage.setItem("isToolTipShown", "true");
      setIsToolTipShown(true);
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!id && event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSaveClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSaveClick]);

  return (
    <>
      {isToolTipShown && (
        <ToolTip
          textAreaRef={textareaRef}
          isOpen={isToolTipShown}
          setIsOpen={setIsToolTipShown}
        />
      )}
      {!id && (
        <>
          <KeyboardModal
            textAreaRef={textareaRef}
            isOpen={openKeyboardModal}
            setIsOpen={setOpenKeyboardModal}
            isModalOpen={openModal}
          />
          <AlertToast
            openAlertToast={openAlertToast}
            setOpenAlertToast={setOpenAlertToast}
          />
        </>
      )}
      <div className={styles.header}>
        <Link to="/">
          <h1>
            <span className={styles.header__mini}>mini</span>bin
          </h1>
        </Link>
        {!id && (
          <div className={styles.header__right}>
            <CustomSelect
              onSelect={handleLanguageChange}
              textAreaRef={textareaRef}
              isModalOpen={openModal}
            />
            <button className={styles.btn__help}>
              <img
                src="assets/icons/question.png"
                className={styles.btn__help__icon}
                alt="Help"
                onClick={() => setOpenKeyboardModal(true)}
              />
            </button>
          </div>
        )}
      </div>
      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onSuccessClick={handleSuccessClick}
        onCancelClick={handleCancelClick}
        textAreaRef={textareaRef}
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
              disabled={openModal}
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
