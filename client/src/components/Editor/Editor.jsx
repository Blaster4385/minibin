import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Prism from "prismjs";
import styles from "./Editor.module.css";
import "../prism-themes/prism-gruvbox-dark.css";
import "../prism-themes/prism-line-numbers.css";
import { BASE_URL, URL_REGEX } from "../../utils/constants";
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
  const queryParams = new URLSearchParams(location.search);

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleScroll = () => {
    if (textareaRef.current && lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSaveClick = async () => {
    if (!text) {
      alert("Please enter some text!");
      return;
    }
    if (URL_REGEX.test(text)) {
      const response = await fetch(`${BASE_URL}/bin`, {
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
        navigator.clipboard
          .writeText(`${window.location.origin}/r/${data.id}`)
          .then(
            function () {
              alert("Short URL copied to clipboard!");
            },
            function () {
              try {
                document.execCommand("copy");
                alert("Short URL copied to clipboard!");
              } catch (err) {
                console.log("Oops, unable to copy");
              }
            },
          );
      }
      navigate(`/${data.id}`);
      return;
    }
    setOpenModal(true);
  };

  const handleSuccessClick = async () => {
    setOpenModal(false);
    const key = await generateAESKey();
    const keyString = await keyToString(key);
    const { encrypted, iv } = await encryptAES(text, key);
    const encryptedBase64 = btoa(
      String.fromCharCode.apply(null, new Uint8Array(encrypted)),
    );
    const ivBase64 = btoa(String.fromCharCode.apply(null, iv));

    const response = await fetch(`${BASE_URL}/bin`, {
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
      navigator.clipboard
        .writeText(`${window.location.origin}/${data.id}?key=${keyString}`)
        .then(
          function () {
            navigator.clipboard.writeText(
              `${window.location.origin}/${data.id}?key=${keyString}`,
            );
            alert("URL copied to clipboard!");
          },
          function () {
            try {
              document.execCommand("copy");
              alert("URL copied to clipboard!");
            } catch (err) {
              console.log("Oops, unable to copy");
            }
          },
        );
      navigate(`/${data.id}?key=${keyString}`);
    } else {
      console.error(data);
    }
  };

  const handleCancelClick = async () => {
    setOpenModal(false);
    const response = await fetch(`${BASE_URL}/bin`, {
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
      navigator.clipboard
        .writeText(`${window.location.origin}/${data.id}`)
        .then(
          function () {
            navigator.clipboard.writeText(
              `${window.location.origin}/${data.id}`,
            );
            alert("URL copied to clipboard!");
          },
          function () {
            try {
              document.execCommand("copy");
              alert("URL copied to clip`board!");
            } catch (err) {
              console.log("Oops, unable to copy");
            }
          },
        );
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
      const response = await fetch(`${BASE_URL}/bin/${id}`);
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
            setText(`Your shortened URL: ${window.location.origin}/r/${id}`);
          } else {
            setLanguage(data.language);
            setText(data.content);
          }
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
      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onSuccessClick={() => {
          handleSuccessClick();
        }}
        onCancelClick={() => {
          handleCancelClick();
        }}
      />
      <div className={styles.container}>
        {!id && (
          <button
            className={styles.btn__save}
            onClick={() => {
              handleSaveClick();
            }}
          >
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

