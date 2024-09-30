import React, { useState, useRef, createRef, useEffect } from "react";
import styles from "../modules/Tierlist.module.css";
import AllPages from "./AllPages";
import { useScreenshot, createFileName } from "use-react-screenshot";
import Dragula from "react-dragula";
import qrCode1 from "../assets/QRCodde.png";
import qrCode from "../assets/QRCode.jpg";
import Nekoobs from "../assets/Liu_NoBg.png";
import UpArrow from "../assets/arrowUp.png";
import DownArrow from "../assets/arrowDown.png";

function Tierlist() {
  const ref = createRef(null);

  const [image, takeScreenShot] = useScreenshot({
    type: "image/png",
    quality: 1,
  });

  const download = (image, { name = "img", extension = "png" } = {}) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
  };

  const downloadScreenshot = () =>
    takeScreenShot(ref.current, { scale: 3 }).then(download);

  /*Default Row*/
  const [row, setRow] = useState(["A", "B", "C", "D", "F"]);

  /*Default Candidates*/
  const [candidates, setCandadates] = useState([
    qrCode,
    qrCode,
    qrCode1,
    qrCode,
    qrCode1,
    qrCode,
    qrCode,
    qrCode,
    qrCode1,
    qrCode,
    qrCode1,
    qrCode,
    qrCode,
    qrCode,
    qrCode1,
    qrCode,
    qrCode1,
    qrCode,
  ]);

  useEffect(() => {
    const drake = Dragula({
      isContainer: function (el) {
        return (
          el.classList.contains(styles.picBox) ||
          el.classList.contains(styles.candidates)
        );
      },
    });
    return () => {
      drake.destroy();
    };
  }, []);

  const [addRowText, setAddrowText] = useState("");

  function addRowHandler() {
    setRow((prev) => [...prev, addRowText]);
    setAddrowText((prev) => "");
  }

  function moveRow(currentRow, direction) {
    const currentIndex = [...currentRow.parentNode.children].indexOf(
      currentRow
    );
    const targetIndex = currentIndex + direction;

    if (
      targetIndex >= 0 &&
      targetIndex < currentRow.parentNode.children.length
    ) {
      const targetRow = currentRow.parentNode.children[targetIndex];
      currentRow.parentNode.insertBefore(
        currentRow,
        direction > 0 ? targetRow.nextSibling : targetRow
      );
    }
  }

  function upArrowHandler(e) {
    const currentRow = e.target.closest(`.${styles.rank}`);
    moveRow(currentRow, -1);
  }

  function downArrowHandler(e) {
    const currentRow = e.target.closest(`.${styles.rank}`);
    moveRow(currentRow, 1);
  }

  const [isVisible, setIsVisible] = useState(false);

  const [currentText, setCurrentText] = useState("");
  const [currentSpanIndex, setCurrentSpanIndex] = useState("");
  const [currentSpanRow, setCurrentSpanRow] = useState("");
  const [currentRowDelete, setCurrentRowDelete] = useState("");
  const [headerColor, setHeaderColor] = useState("");
  const [currentColorHeader, setCurrentColorHeader] = useState("");

  function rgbToHex(rgb) {
    const rgbValues = rgb.match(/\d+/g).map(Number);
    const hex = rgbValues.map((value) => value.toString(16).padStart(2, "0"));
    return `#${hex.join("")}`;
  }

  function settingsHandler(e) {
    setIsVisible(!isVisible);
    if (e) {
      const currentSpan = e.target
        .closest(`.${styles.rank}`)
        .querySelector(`.${styles.headerText}`);
      setCurrentText(currentSpan.textContent);
      const currentRow = e.target.closest(`.${styles.rank}`);
      setCurrentRowDelete(e.target.closest(`.${styles.rank}`));
      setCurrentSpanIndex(
        [...currentRow.parentNode.children].indexOf(currentRow)
      );
      setCurrentSpanRow([...currentRow.parentNode.children]);

      const displayColor = e.target
        .closest(`.${styles.rank}`)
        .querySelector(`.${styles.header}`);
      const hexColor = rgbToHex(displayColor.style.backgroundColor);
      setHeaderColor(hexColor);
      setCurrentColorHeader(displayColor);
    }
  }
  function textEditor(e) {
    const updatedText = e.target.value;
    setCurrentText(updatedText);

    currentSpanRow[currentSpanIndex].querySelector(
      `.${styles.headerText}`
    ).textContent = updatedText;
  }

  function settingDelete() {
    currentRowDelete.remove();
    setIsVisible(!isVisible);
  }

  function colorHandler(e) {
    setHeaderColor(e.target.value);
    currentColorHeader.style.backgroundColor = headerColor;
  }

  return (
    <>
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? "visible" : "hidden",
          transition: "opacity 0.2s linear",
        }}
        className={styles.settingPage}
      >
        <div className={styles.settingOptions}>
          <div className={styles.settingDisableButton}>
            <img
              className={styles.settingDisablePic}
              onClick={() => settingsHandler()}
              src={Nekoobs}
            />
          </div>
          <div className={styles.settingText}>
            <textarea
              name="altTextInput"
              className={styles.settingAltInput}
              value={currentText}
              onChange={(e) => textEditor(e)}
            />
            <div className={styles.settingOptionsButton}>
              <button
                className={styles.settingDelete}
                onClick={() => settingDelete()}
              >
                KYS RN
              </button>
              <input
                type="color"
                value={headerColor}
                className={styles.settingColor}
                onChange={(e) => colorHandler(e)}
              />
            </div>
          </div>
        </div>
      </div>
      <AllPages />
      <div className={styles.topText}>Tierlist 0.70beta</div>
      <div className={styles.tierlistContainer}>
        <div className={styles.tierlistRankContainer}>
          <div className={styles.tierlistRank} ref={ref}>
            {row.map((code, index) => (
              <div key={`tierlistRank ${index}`} className={styles.rank}>
                <div
                  style={{ backgroundColor: "#FF6666" }}
                  className={styles.header}
                >
                  <span
                    className={styles.headerText}
                    contentEditable
                    suppressContentEditableWarning={true}
                  >
                    {code}
                  </span>
                </div>
                <div className={styles.picBox}></div>
                <div className={styles.setting}>
                  <div className={styles.settingIcon}>
                    <img
                      className={styles.settingPic}
                      src={Nekoobs}
                      onClick={(e) => settingsHandler(e)}
                    />
                  </div>
                  <div className={styles.settingArrow}>
                    <div
                      className={styles.arrowContainer}
                      onClick={(e) => upArrowHandler(e)}
                    >
                      <img className={styles.arrowUpDown} src={UpArrow} />
                    </div>
                    <div
                      className={styles.arrowContainer}
                      onClick={(e) => downArrowHandler(e)}
                    >
                      <img className={styles.arrowUpDown} src={DownArrow} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.input}>
            <button
              className={styles.inputAddRowButton}
              onClick={addRowHandler}
            >
              Add Row
            </button>
            <input
              className={styles.inputAddRowText}
              type="text"
              value={addRowText}
              name="addRowText"
              onChange={(e) => setAddrowText(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className={styles.rankHandlerContainer}>
        <div className={styles.rankHandler}>
          <div className={styles.candidates}>
            {candidates.map((code, index) => (
              <div
                className={styles.candidatesContainer}
                style={{
                  backgroundImage: `url(${code})`,
                }}
                key={index}
                alt={`pic ${index + 1}`}
              >
                <img
                  src={code}
                  style={{ display: "none" }}
                  alt={`pic ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.sceenshotContainer}>
        <button onClick={downloadScreenshot} className={styles.sceenshot}>
          Sigma Mode
        </button>
      </div>
    </>
  );
}

export default Tierlist;
