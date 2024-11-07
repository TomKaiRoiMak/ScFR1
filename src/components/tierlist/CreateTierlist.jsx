import React, {
  useState,
  useRef,
  createRef,
  useEffect,
  useCallback,
} from "react";
import styles from "../../modules/tierlistmodules/CreateTierlist.module.css";
import AllPages from "../AllPages.jsx";
import Dragula from "react-dragula";
import Nekoobs from "../../assets/Liu_NoBg.png";
import UpArrow from "../../assets/arrowUp.png";
import DownArrow from "../../assets/arrowDown.png";
import axios from "axios";
import editIcon from "../../assets/EditIcon.png";
import colorBucket from "../../assets/goofy_ahh_bucket.png";
import { useDropzone } from "react-dropzone";
import CandidateImage from "./script/candidateImage.jsx";

const CreateTierlist = () => {
  const [sentAlert, setSentAlert] = useState(false);

  const [toUploadImages, setToUploadImages] = useState([]);
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!sentAlert) {
        alert("These won't be saved when reload!");
        setSentAlert(!sentAlert);
      }
      const newFiles = [];
      const files = acceptedFiles;
      files.forEach((file) => {
        const reader = new FileReader();
        newFiles.push(file);

        reader.onload = () => {
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
      setToUploadImages((prev) => [...prev, ...newFiles]);
    },
    [sentAlert]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png", ".jpg"],
    },
  });

  const [status, setStatus] = useState("Offine❌");
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
  }, []);

  ////////////////////////////////////////////////////////////////////////////

  const testTierList1 = {
    rank: "A",
    background_color: "rgb(255, 102, 102)",
    text_color: "rgb(0, 0, 0)",
    candidates: [],
  };
  const testTierList2 = {
    rank: "B",
    background_color: "rgb(255, 102, 102)",
    text_color: "rgb(0, 0, 0)",
    candidates: [],
  };
  const testTierList3 = {
    rank: "C",
    background_color: "rgb(255, 102, 102)",
    text_color: "rgb(0, 0, 0)",
    candidates: [],
  };
  const testTierList4 = {
    rank: "D",
    background_color: "rgb(255, 102, 102)",
    text_color: "rgb(0, 0, 0)",
    candidates: [],
  };
  const tempDefault = {
    id: "default",
    all_ranks: [testTierList1, testTierList2, testTierList3, testTierList4],
    remained_candidates: [],
  };

  const [currentTierList, setCurrentTierList] = useState(tempDefault);

  useEffect(() => {
    const drake = Dragula({
      isContainer: function (el) {
        return el.classList.contains(styles.candidates);
      },
    });

    return () => {
      drake.destroy();
    };
  }, []);

  const [addRowText, setAddrowText] = useState("");

  function addRowHandler() {
    console.log(toUploadImages);

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
    setAddrowText("");
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

  const [uniqueId, setUniqueId] = useState(makeid(5));
  ///////////////////upLoadTierlistHandler
  function modPreUploadTierlistHandler() {
    const elements = document.getElementsByClassName(`${styles.rank}`);
    const allRanks = [];
    for (let i = 0; i < elements.length; i++) {
      const rankText = elements[i].querySelector(
        `.${styles.headerText}`
      ).textContent;
      const backGroundColor = elements[i].querySelector(`.${styles.header}`)
        .style.backgroundColor;
      const textColor = elements[i].querySelector(`.${styles.header}`).style
        .color;
      const rankObject = {
        rank: rankText,
        background_color: backGroundColor,
        text_color: textColor,
        candidates: [],
      };
      allRanks.push(rankObject);
    }
    const readyRankObject = {
      PublicName,
      PublicDescription,
      all_ranks: allRanks,
    };

    console.log(readyRankObject);
    return readyRankObject;
  }

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

  useEffect(() => {
    const savedCreateTierlist = sessionStorage.getItem("storageCreateTierlist");
    if (savedCreateTierlist) {
      const parsedTierlist = JSON.parse(savedCreateTierlist);
  
      console.log("Parsed tier list:", parsedTierlist); // ตรวจสอบโครงสร้างข้อมูล
  
      setCurrentTierList((prev) => ({
        ...prev,
        all_ranks: parsedTierlist.all_ranks,
      }));
    }
  }, []);
  

  useEffect(() => {
    if (resetCount == 0) {
      trySave();
    }
  });

  function trySave() {
    sessionStorage.setItem(
      "storageCreateTierlist",
      JSON.stringify(modPreUploadTierlistHandler())
    );
  }

  //TODO resetHandler
  const [resetCount, setResetCount] = useState(0);
  const [resetValue, setResetValue] = useState("Reset");

  function resetTierlistHandler() {
    setResetCount((prev) => prev + 1);
    console.log(resetCount);
    if (resetCount > 0) {
      sessionStorage.removeItem("storageCreateTierlist");
      window.location.reload();
    } else {
      setResetValue(() => "Sure?");
    }

    setTimeout(() => (setResetCount(0), setResetValue(() => "Reset")), 3000);
  }

  const [PublicName, setPublicName] = useState("");
  const [PublicDescription, setPublicDescription] = useState("");

  function UploadPublicTemplate() {
    if (!PublicName) {
      alert("Please insert name!");
      return;
    }
    if (toUploadImages.length == 0) {
      alert("Please import image!");
      return;
    }
    const elements = document.getElementsByClassName(`${styles.rank}`);
    const allRanks = [];
    for (let i = 0; i < elements.length; i++) {
      const rankText = elements[i].querySelector(
        `.${styles.headerText}`
      ).textContent;
      const backGroundColor = elements[i].querySelector(`.${styles.header}`)
        .style.backgroundColor;
      const textColor = elements[i].querySelector(`.${styles.header}`).style
        .color;
      const rankObject = {
        rank: rankText,
        background_color: backGroundColor,
        text_color: textColor,
        candidates: [],
      };
      allRanks.push(rankObject);
    }
    const readyRankObject = {
      id: "",
      name: "",
      description: "",
      all_ranks: allRanks,
      remained_candidates: [],
    };

    console.log(readyRankObject);
    const formData = new FormData();
    formData.append("name", PublicName);
    formData.append("description", PublicDescription);
    formData.append("rankObject", JSON.stringify(readyRankObject));
    toUploadImages.forEach((file) => {
      formData.append(`candidates`, file);
      console.log(...formData);
    });
    axios
      .post("http://127.0.0.1:4000/addTemplate", formData)
      .then(() => alert("Upload Completed!"))
      .catch((error) => {
        console.error("Error adding template:", error);
      });
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
      <div className={styles.topText}>Tierlist Preview</div>
      <div className={styles.createContainer}>
        <div className={styles.createNameContainer}>
          <div className={styles.createNameBox}>
            <h1>Tierlist Name</h1>
            <input
              placeholder="name"
              value={PublicName}
              onChange={(e) => setPublicName(e.target.value)}
              type="text"
              className={styles.createInputName}
              name="createNameContainer"
            />
          </div>
        </div>
        <div className={styles.createDescContainer}>
          <div className={styles.createDescBox}>
            <h1>Description</h1>
            <textarea
              value={PublicDescription}
              onChange={(e) => setPublicDescription(e.target.value)}
              placeholder="description"
              className={styles.createInputDesc}
              name="createDescContainer"
            />
          </div>
        </div>
      </div>
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
                      style={{ backgroundImage: `url("${candidate}")` }}
                      className={styles.candidatesContainer}
                      alt={`candidateDiv ${candidateIndex + 1}`}
                      data-bg-image="true"
                    >
                      <img
                        src={candidate}
                        className={styles.candidatesContainer}
                        alt={`cantidateImg ${candidateIndex + 1}`}
                      />
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
          </div>
          <div className={styles.inputMultiContainer}>
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
        <div {...getRootProps()} className={styles.uploaderContainer}>
          <input {...getInputProps()} className={styles.uploader} />
          {isDragActive ? (
            <p className={styles.uploader}>Drop here</p>
          ) : (
            <p className={styles.uploader}>Upload Here</p>
          )}
        </div>
      </div>
      <div className={styles.createPublicTemplateContainer}>
        <button
          className={styles.createPublicTemplateButton}
          onClick={() => UploadPublicTemplate()}
        >
          Create Public Template!
        </button>
      </div>
    </>
  );
};

export default CreateTierlist;
