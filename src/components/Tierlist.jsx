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
import axios from "axios";

function Tierlist() {
  const [status, setStatus] = useState("Offine❌");
  //http://127.0.0.1:4000
  useEffect(() => {
    axios
      .get("https://60b1-1-46-136-232.ngrok-free.app/online", {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then(() => {
        setStatus(() => "Online✅");
      })
      .catch((err) => {
        console.error("Tierlist Error : ", err);
        setStatus(() => "Offine❌");
      });
  }, []);

  const ref = createRef(null);

  const [image, takeScreenShot] = useScreenshot({
    type: "image/png",
    quality: 1,
  });

  const download = (
    image,
    { name = "TierlistImg", extension = "png" } = {}
  ) => {
    const a = document.createElement("a");
    a.href = image;
    a.download = createFileName(extension, name);
    a.click();
  };

  const downloadScreenshot = () =>
    takeScreenShot(ref.current, { scale: 3 }).then(download);

  ////////////////////////////////////////////////////////////////////////////

  const testTierList1 = {
    rank: "A",
    background_color: "rgb(255, 102, 102)",
    candidates: [
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCode.jpg")',
    ],
  };
  const testTierList2 = {
    rank: "B",
    background_color: "rgb(255, 102, 102)",
    candidates: [
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCodde.png")',
      'url("/src/assets/QRCodde.png")',
      'url("/src/assets/QRCode.jpg")',
    ],
  };
  const testTierList3 = {
    rank: "C",
    background_color: "rgb(255, 102, 102)",
    candidates: ['url("/src/assets/QRCode.jpg")'],
  };
  const testTierList4 = {
    rank: "D",
    background_color: "rgb(255, 102, 102)",
    candidates: [
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCodde.png")',

      'url("/src/assets/QRCode.jpg")',
    ],
  };
  const tempDefault = {
    id: "default",
    all_ranks: [testTierList1, testTierList2, testTierList3, testTierList4],
    remained_candidates: [
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCodde.png")',
      'url("/src/assets/QRCodde.png")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCodde.png")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCodde.png")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCodde.png")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCodde.png")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCode.jpg")',
      'url("/src/assets/QRCode.jpg")',
    ],
  };

  const [storageTierList, setStorageTierList] = useState(() => {
    // sessionStorage.clear();

    const savedData = sessionStorage.getItem("storageTierList");
    return savedData ? JSON.parse(savedData) : tempDefault;
  });

  const [currentTierList, setCurrentTierList] = useState(storageTierList);

  useEffect(() => {
    setTimeout(() => setCurrentTierList(storageTierList), 200);
  }, [storageTierList]);

  useEffect(() => {
    sessionStorage.setItem("storageTierList", JSON.stringify(storageTierList));
    console.log("Storage: ", storageTierList);
  }, [storageTierList]);

  /////////////////////////////////////////////////////////

  /* Before introduced Object
  Default Row
  const [row, setRow] = useState(["A", "B", "C", "D", "F"]);

  /*Default Candidates
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
  */

  //TODO Dragula
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
    const rankTemplate = {
      rank: addRowText,
      background_color: "rgb(255, 102, 102)",
      candidates: [],
    };
    setCurrentTierList((prev) => ({
      ...prev,
      all_ranks: [...prev.all_ranks, rankTemplate],
    }));
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

  const [test, setTest] = useState("");
  const [upLoadText, setUpLoadText] = useState("");

  ///////////////////upLoadTierlistHandler
  function upLoadTierlistHandler() {
    const remainedCandidates = [];
    const remained = document.getElementsByClassName(`${styles.candidates}`);

    Array.from(remained).forEach((element) => {
      const candidates = element.querySelectorAll(
        `.${styles.candidatesContainer}`
      );
      candidates.forEach((c) => {
        remainedCandidates.push(c.style.backgroundImage);
        console.log(remainedCandidates);
      });
    });

    const elements = document.getElementsByClassName(`${styles.rank}`);
    setUpLoadRank(() => {});
    const allRanks = [];
    for (let i = 0; i < elements.length; i++) {
      const backgroundImage = [];
      const rankText = elements[i].querySelector(
        `.${styles.headerText}`
      ).textContent;
      const backGroundColor = elements[i].querySelector(`.${styles.header}`)
        .style.backgroundColor;
      const candidates = elements[i].querySelectorAll(
        `.${styles.candidatesContainer}`
      );
      candidates.forEach((candidate) => {
        backgroundImage.push(candidate.style.backgroundImage);
        console.log(candidate.style.backgroundImage);
        console.log(
          document.querySelector(`.${styles.inputAddRowButton}`).style
            .backgroundImage
        );
      });
      const rankObject = {
        rank: rankText,
        background_color: backGroundColor,
        candidates: backgroundImage,
      };
      console.log(rankObject);
      allRanks.push(rankObject);
    }
    console.log(allRanks);
    const uniqueId = makeid(5);
    const readyRankObject = {
      id: uniqueId,
      all_ranks: allRanks,
      remained_candidates: remainedCandidates,
    };

    console.log(readyRankObject);

    axios
      .post("https://60b1-1-46-136-232.ngrok-free.app/addTierList", readyRankObject)
      .then((r) => {
        setUpLoadText(() => r.data);
      })
      .catch((error) => {
        console.error("Error adding message:", error);
      });
  }

  //NewZone

  //New Zone
  function makeid(length) {
    //Thanks for this, found on stackoverflow
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  const [upLoadRank, setUpLoadRank] = useState([]);
  const [upLoadTierList, setUpLoadTierList] = useState([]);

  function loadTierlistHandler(id) {
    //testLoad
    if (!id) {
      return;
    }
    axios
      .get(`https://60b1-1-46-136-232.ngrok-free.app/loadRankObjects/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then((r) => {
        if (Array.isArray(r.data.all_ranks) && r.data.all_ranks.length > 0) {
          setStorageTierList(() => r.data);
          window.location.reload();
        } else {
          setUpLoadText("Data not found");
        }
      })
      .catch(() => setUpLoadText("Data not Found"));
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
    console.log(upLoadRank);

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

  //TODO resetHandler
  const [resetCount, setResetCount] = useState(0);
  const [resetValue, setResetValue] = useState("Reset");

  function resetTierlistHandler() {
    setResetCount((prev) => prev + 1);
    console.log(resetCount);
    if (resetCount > 0) {
      window.location.reload();
      setStorageTierList(() => tempDefault);
    } else {
      setResetValue(() => "Sure?");
    }

    setTimeout(() => (setResetCount(0), setResetValue(() => "Reset")), 3000);
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
      <div className={styles.topText}>Tierlist 1.0release</div>
      <div className={styles.tierlistContainer}>
        <div className={styles.tierlistRankContainer}>
          <div className={styles.tierlistRank} ref={ref}>
            {currentTierList.all_ranks.map((rankObject, index) => (
              <div key={`tierlistRank ${index}`} className={styles.rank}>
                <div
                  style={{ backgroundColor: rankObject.background_color }}
                  className={styles.header}
                >
                  <span
                    className={styles.headerText}
                    contentEditable
                    suppressContentEditableWarning={true}
                  >
                    {rankObject.rank}
                  </span>
                </div>
                <div
                  className={styles.picBox}
                  //////////Unselected Candidates
                >
                  {rankObject.candidates.map((candidate, candidateIndex) => (
                    <div
                      key={`candidate ${candidateIndex}`}
                      style={{ backgroundImage: candidate }}
                      className={styles.candidatesContainer}
                      alt={`pic ${candidateIndex + 1}`}
                    ></div>
                  ))}
                </div>
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
          <div className={styles.inputMultiContainer}>
            <button
              className={styles.inputAddRowButton}
              onClick={() => addRowHandler()}
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
          <div className={styles.inputMultiContainer}>
            <button ///////////// Save
              className={styles.inputAddRowButton}
              onClick={() => upLoadTierlistHandler(upLoadText)}
            >
              Save
            </button>
            <input /////////////////Load
              className={styles.inputAddRowText}
              type="text"
              value={upLoadText}
              name="upLoadText"
              onChange={(e) => setUpLoadText(e.target.value)}
            />
            <button
              className={styles.inputLoadButton}
              onClick={() => loadTierlistHandler(upLoadText)}
            >
              Load
            </button>
            <div className={styles.serverStatus}>
              <h1 className={styles.serverStatusText}>
                Server Status : {status}
              </h1>
              <button
                className={styles.resetButton}
                onClick={() => resetTierlistHandler()}
              >
                {resetValue}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.rankHandlerContainer}>
        <div className={styles.rankHandler}>
          <div className={styles.candidates}>
            {currentTierList.remained_candidates.map(
              (candidate, candidateindex) => (
                <div
                  className={styles.candidatesContainer}
                  style={{
                    backgroundImage: candidate,
                  }}
                  key={`candidate ${candidateindex}`}
                  alt={`pic ${candidateindex + 1}`}
                ></div>
              )
            )}
          </div>
        </div>
      </div>
      <div className={styles.sceenshotContainer}>
        <button
          onClick={() => downloadScreenshot()}
          className={styles.sceenshot}
        >
          Download
        </button>
      </div>
    </>
  );
}

export default Tierlist;
