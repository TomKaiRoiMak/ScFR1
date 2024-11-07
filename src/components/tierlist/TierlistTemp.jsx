import React, {
  useState,
  useRef,
  createRef,
  useEffect,
  useCallback,
} from "react";
import styles from "../../modules/tierlistmodules/TemplatePage.module.css";
import AllPages from "../AllPages.jsx";
import Dragula from "react-dragula";
import Nekoobs from "../../assets/Liu_NoBg.png";
import UpArrow from "../../assets/arrowUp.png";
import DownArrow from "../../assets/arrowDown.png";
import axios from "axios";
import editIcon from "../../assets/EditIcon.png";
import colorBucket from "../../assets/goofy_ahh_bucket.png";
import html2canvas from "html2canvas";
import { useDropzone } from "react-dropzone";
import CandidateImage from "./script/candidateImage.jsx";

const TierlistTemp = () => {
  const [saveable, setSaveable] = useState(true);

  const onDrop = useCallback((acceptedFiles) => {
    const files = acceptedFiles;
    setSaveable(() => false);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log(reader.result);
        setCurrentTierList((prev) => ({
          ...prev,
          remained_candidates: [
            ...prev.remained_candidates,
            `url(${reader.result})`,
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png", ".jpg", ".gif"],
    },
  });

  //import AWS from "aws-sdk";
  //   AWS.config.update({
  //     accessKeyId: import.meta.env.VITE_AWS_S3_ACCESS_KEY,
  //     secretAccessKey: import.meta.env.VITE_AWS_S3_SECRET_KEY,
  //     region: import.meta.env.VITE_AWS_REGION,
  //   });

  //   const s3 = new AWS.S3();

  //   const uploadFile = (file) => {
  //     if (!file) {
  //       console.error("No file selected!");
  //       return;
  //     }
  //     const newFileName = `${makeid(10)}.${file.name.split(".").pop()}`;
  //     const params = {
  //       Bucket: import.meta.env.VITE_S3_BUCKET_NAME,
  //       Key: `tomkaiscfrimages/tierlistscfrimages/${newFileName || file.name}`,
  //       Body: file,
  //     };

  //     s3.upload(params, (err, data) => {
  //       if (err) {
  //         console.error("Uplop s3 error : ", err);
  //       } else {
  //         console.log("Upload Completed : ", data.Location);
  //       }
  //     });
  //   };

  const [status, setStatus] = useState("Offine❌");

  const [idCount, setIDCount] = useState("Not Connected");
  //http://127.0.0.1:4000
  useEffect(() => {
    axios
      .get("http://127.0.0.1:4000/online", {
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
    axios
      .get("http://127.0.0.1:4000/get_id_count", {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then((r) => {
        setIDCount(() => r.data);
      })
      .catch((err) => {
        console.error("get_id_count error : ", err);
      });
  }, []);

  const downloadScreenshot = () => {
    const element = document.querySelector(`.${styles.tierlistRank}`);

    console.log(element);
    if (!element) {
      return;
    }
    element.crossOrigin = "anonymous";
    html2canvas(element, {
      scale: 3,
      useCORS: true,
    })
      .then((canvas) => {
        let image64 = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image64;
        a.download = `your-tierlist-${makeid(10)}`;
        a.click();
      })
      .catch((err) => console.error(err));
  };

  const downloadImageFromURL = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `your-tierlist-${makeid(10)}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  const toDataURL = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting to Data URL:", error);
    }
  };

  toDataURL(
    "https://tomkaiscfr.s3.ap-southeast-1.amazonaws.com/tomkaiscfrimages/tierlistscfrimages/KMLJeTfhR2.jpg"
  ).then((dataUrl) => {
  });

  ////////////////////////////////////////////////////////////////////////////

  const testTierList1 = {
    rank: "A",
    background_color: "rgb(255, 102, 102)",
    text_color: "rgb(0, 0, 0)",
    candidates: [
      'url("https://tomkaiscfr.s3.ap-southeast-1.amazonaws.com/tomkaiscfrimagestierlistimages0ktiEIbwu.png")',
      'url("https://tomkaiscfr.s3.ap-southeast-1.amazonaws.com/tomkaiscfrimagestierlistimager1y5oEzHo5.png")',
      'url("https://tomkaiscfr.s3.ap-southeast-1.amazonaws.com/tomkaiscfrimages/tomkaitierlistimagestierlistimageeRzhMkxvMG.jpg")',
      'url("https://tomkaiscfr.s3.ap-southeast-1.amazonaws.com/tomkaiscfrimages/tierlistimage4BOFCyNQWf.jpg")',
      'url("https://tomkaiscfr.s3.ap-southeast-1.amazonaws.com/tomkaiscfrimages/tomkaitierlistimagestierlistimagebLiS0m2nZX.gif")',
      'url("https://tomkaiscfr.s3.ap-southeast-1.amazonaws.com/tomkaiscfrimages/tierlistscfrimages/KMLJeTfhR2.jpg")',
    ],
  };
  const testTierList2 = {
    rank: "B",
    background_color: "rgb(255, 102, 102)",
    text_color: "rgb(0, 0, 0)",
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
    text_color: "rgb(0, 0, 0)",
    candidates: ['url("/src/assets/QRCode.jpg")'],
  };
  const testTierList4 = {
    rank: "D",
    background_color: "rgb(255, 102, 102)",
    text_color: "rgb(0, 0, 0)",
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
  //TODO changeUniqueI

  /////////////////////////////////////////////////////////

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
    drake.on("dragend", () => {
      sessionStorage.setItem(
        "storageTierList",
        JSON.stringify(preUploadTierlistHandler())
      );
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
      text_color: "rgb(0, 0, 0)",
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
  const [uniqueId, setUniqueId] = useState(makeid(5));
  ///////////////////upLoadTierlistHandler
  function preUploadTierlistHandler() {
    const remainedCandidates = [];
    const remained = document.getElementsByClassName(`${styles.candidates}`);

    Array.from(remained).forEach((element) => {
      const candidates = element.querySelectorAll(
        `.${styles.candidatesContainer}[data-bg-image="true"]`
      );
      candidates.forEach((c) => {
        remainedCandidates.push(c.style.backgroundImage);
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
      const textColor = elements[i].querySelector(`.${styles.header}`).style
        .color;
      const candidates = elements[i].querySelectorAll(
        `.${styles.candidatesContainer}[data-bg-image="true"]`
      );
      console.log(candidates);
      candidates.forEach((candidate) => {
        backgroundImage.push(candidate.style.backgroundImage);
        console.log(backgroundImage);
      });
      const rankObject = {
        rank: rankText,
        background_color: backGroundColor,
        text_color: textColor,
        candidates: backgroundImage,
      };
      allRanks.push(rankObject);
    }
    const readyRankObject = {
      id: uniqueId,
      all_ranks: allRanks,
      remained_candidates: remainedCandidates,
    };

    console.log(readyRankObject);
    return readyRankObject;
  }

  function upLoadTierlistHandler() {
    if (!saveable) {
      alert("create template if you to save imported images!");
      return;
    }
    const toGo = preUploadTierlistHandler();
    axios
      .post("http://127.0.0.1:4000/addTierList", toGo)
      .then((r) => {
        setUpLoadText(() => r.data);
      })
      .catch((error) => {
        console.error("Error adding message:", error);
      });
    setUniqueId(() => makeid(5));
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

  function loadTierlistHandler(id) {
    if (!id) {
      return;
    }
    axios
      .get(`http://127.0.0.1:4000/loadRankObjects/${id}`, {
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
  const [currentColorHeader, setCurrentColorHeader] = useState("");
  const [currentColorText, setCurrentColorText] = useState("");
  const [headerColor, setHeaderColor] = useState("");
  const [textColor, setTextColor] = useState("");

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

      //TODO rowColor and textColor
      const displayColor = e.target
        .closest(`.${styles.rank}`)
        .querySelector(`.${styles.header}`);

      const hexColorSpan = rgbToHex(displayColor.style.backgroundColor);
      const hexColorSpanText = rgbToHex(displayColor.style.color);
      setHeaderColor(hexColorSpan);
      setCurrentColorHeader(displayColor);
      setTextColor(hexColorSpanText);
      setCurrentColorText(displayColor);
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

  function spanColorHandler(e) {
    setHeaderColor(e.target.value);
    currentColorHeader.style.backgroundColor = headerColor;
  }
  function textColorHandler(e) {
    setTextColor(e.target.value);
    currentColorText.style.color = textColor;
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
      <style>{`body{background-color: #fae8e8;}`}</style>
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
              //TODO altText
              placeholder="name"
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
                Remove
              </button>
              <div className={styles.colorContainer}>
                <input
                  //TODO changeSpanColor
                  type="color"
                  value={headerColor}
                  className={styles.settingColor}
                  onChange={(e) => spanColorHandler(e)}
                />
                <img src={colorBucket} className={styles.colorBucket} />
              </div>
              <div className={styles.colorContainer}>
                <input
                  //TODO changeTextColor
                  type="color"
                  value={textColor}
                  className={styles.settingColor}
                  onChange={(e) => textColorHandler(e)}
                />
                <img src={editIcon} className={styles.colorBucket} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <AllPages />
      <div className={styles.topText}>Tierlist 1.0release</div>
      <div className={styles.tierlistContainer}>
        <div className={styles.tierlistRankContainer}>
          <div className={styles.tierlistRank}>
            {currentTierList.all_ranks.map((rankObject, index) => (
              <div key={`tierlistRank ${index}`} className={styles.rank}>
                <div
                  style={{
                    backgroundColor: rankObject.background_color,
                    color: rankObject.text_color,
                  }}
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
                      data-bg-image="true"
                    >
                      <CandidateImage imageUrl={candidate} />
                    </div>
                  ))}
                </div>
                <div className={styles.setting}>
                  <div className={styles.settingIcon}>
                    <img
                      className={styles.settingPic}
                      src={editIcon}
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
              placeholder="name"
              value={addRowText}
              name="addRowText"
              onChange={(e) => setAddrowText(e.target.value)}
            />
            <div className={styles.idCountContainer}>
              <h1 className={styles.idCountText}>Count of IDs : {idCount}</h1>
            </div>
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
              placeholder="ID"
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
                  data-bg-image="true"
                  className={styles.candidatesContainer}
                  style={{
                    backgroundImage: candidate,
                  }}
                  key={`candidate ${candidateindex}`}
                  alt={`pic ${candidateindex + 1}`}
                >
                  <CandidateImage imageUrl={candidate} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
      <div className={styles.IOContainer}>
        <button
          onClick={() => downloadScreenshot()}
          className={styles.sceenshot}
        >
          Download
        </button>

        <div {...getRootProps()} className={styles.uploaderContainer}>
          <input {...getInputProps()} className={styles.uploader} />
          {isDragActive ? (
            <p className={styles.uploader}>Drop here</p>
          ) : (
            <p className={styles.uploader}>Upload Here</p>
          )}
        </div>
        <button
          onClick={() =>
            downloadImageFromURL(
              "https://tomkaiscfr.s3.ap-southeast-1.amazonaws.com/tomkaiscfrimages/-516070875956nukwku9gl.png"
            )
          }
        >
          Down
        </button>
      </div>
    </>
  );
};

export default TierlistTemp;
