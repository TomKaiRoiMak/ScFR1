import React, {
  useState,
  useRef,
  createRef,
  useEffect,
  useCallback,
} from "react";
import styles from "../../../modules/tierlistmodules/TemplatePage.module.css";
import AllPages from "../../AllPages.jsx";
import Dragula from "react-dragula";
import Nekoobs from "../../../assets/Liu_NoBg.png";
import UpArrow from "../../../assets/arrowUp.png";
import DownArrow from "../../../assets/arrowDown.png";
import axios from "axios";
import editIcon from "../../../assets/EditIcon.png";
import colorBucket from "../../../assets/goofy_ahh_bucket.png";
import html2canvas from "html2canvas";
import { useDropzone } from "react-dropzone";
import CandidateImage from "../script/candidateImage.jsx";
import { useParams } from "react-router-dom";

const TemplatePage = () => {
  const { templateId } = useParams();
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [saveable, setSaveable] = useState(true);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (saveable) {
        alert("You can't save anymore!");
        setSaveable(false);
      }
      const files = acceptedFiles;
      files.forEach((file) => {
        const reader = new FileReader();
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
    },
    [saveable]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png", ".jpg"],
    },
  });

  const [status, setStatus] = useState("Offine❌");

  const [idCount, setIDCount] = useState("Not Connected");
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_NETWORK_URL}/online`, {
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
      .get(`${import.meta.env.VITE_NETWORK_URL}/get_id_count`, {
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

  const [takingSceenshot, setTakingSceenshot] = useState(false);

  const tempDefault = {
    id: "default",
    all_ranks: [],
    remained_candidates: [],
    name: "",
    description: "",
  };
  function prePreviewDownload() {
    setIsPreviewVisible(true);
    setTakingSceenshot(true);
    setCurrentPreviewTierList(preUploadTierlistHandler());
    setTimeout(() => {
      renderPreviewImage();
      setTakingSceenshot(false);
    }, 10);
  }
  const [currentSceenshotImage, setCurrentSceenshotImage] = useState(null);
  const [currentPreviewTierList, setCurrentPreviewTierList] =
    useState(tempDefault);

  const renderPreviewImage = () => {
    const element = document.querySelector(`.${styles.tierlistRankPreview}`);
    console.log(element);
    if (!element) {
      return;
    }
    html2canvas(element, {

      useCORS: true,
      allowTaint: true,
      allowCORS: true,
      logging: true,
    })
      .then((canvas) => {
        const image64 = canvas.toDataURL("image/png");
        setCurrentSceenshotImage(image64);
      })
      .catch((err) => console.error(err));
  };

  function downloadSceenshot() {
    const a = document.createElement("a");
    a.href = currentSceenshotImage;
    a.download = `your-tierlist-${makeid(10)}`;
    a.click();
    console.log(currentSceenshotImage);
  }

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

  function getTemplate(templateId) {
    axios
      .get(
        `${import.meta.env.VITE_NETWORK_URL}/loadTemplateObject/${templateId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      )
      .then((r) => {
        sessionStorage.setItem(`${templateId}`, JSON.stringify(r.data));
        setCurrentTierList(r.data);
        // sessionStorage.setItem(`test`, JSON.stringify(r.data));
        setPublicName(r.data.name);
        setPublicDescription(r.data.description);
      })
      .catch(() => alert("Data not found"));
  }

  const [storageTierList, setStorageTierList] = useState(() => {
    //sessionStorage.clear();

    const savedData = sessionStorage.getItem(`${templateId}`);
    if (savedData) {
      return JSON.parse(savedData);
    } else {
      getTemplate(templateId);
      return tempDefault;
    }
  });

  const [currentTierList, setCurrentTierList] = useState(storageTierList);

  //TODO changeUniqueI

  /////////////////////////////////////////////////////////

  //TODO Dragula
  useEffect(() => {
    let isDragging = false;

    const handleTouchMove = (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    const drake = Dragula({
      isContainer: function (el) {
        return (
          el.classList.contains(styles.picBox) ||
          el.classList.contains(styles.candidates)
        );
      },
    });

    drake.on("drag", (el) => {
      isDragging = true;
      el.classList.add("grabbing");
    });

    drake.on("dragend", (el) => {
      isDragging = false;
      el.classList.remove("grabbing");
      trySave();
    });

    return () => {
      document.removeEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      drake.destroy();
    };
  }, [saveable]);

  function trySave() {
    if (!saveable) {
      return;
    }
    sessionStorage.setItem(
      `${templateId}`,
      JSON.stringify(preUploadTierlistHandler())
    );
  }

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
    trySave();
  }

  function upArrowHandler(e) {
    const currentRow = e.target.closest(`.${styles.rank}`);
    moveRow(currentRow, -1);
  }

  function downArrowHandler(e) {
    const currentRow = e.target.closest(`.${styles.rank}`);
    moveRow(currentRow, 1);
  }

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
      name: PublicName,
      origin: currentTierList.origin,
      description: PublicDescription,
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
    const checkCandidate = document
      .querySelector(`.${styles.tierlistRank}`)
      ?.querySelector(`.${styles.candidatesContainer}`);


    if (!checkCandidate) {
      alert("No you don't")
      return;
    }

    const toGo = preUploadTierlistHandler();
    axios
      .post(`${import.meta.env.VITE_NETWORK_URL}/addTierList`, toGo)
      .then((r) => {
        setUpLoadText(() => r.data);
      })
      .catch((error) => {
        console.error("error adding", error);
      });
    setUniqueId(() => makeid(5));
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

  function loadTierlistHandler(id) {
    if (!id || !currentTierList.origin) {
      alert("Origin not found");
      return;
    }
    axios
      .get(
        `${import.meta.env.VITE_NETWORK_URL}/loadRankObjects/${id}?origin=${
          currentTierList.origin
        }`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      )
      .then((r) => {
        if (Array.isArray(r.data.all_ranks) && r.data.all_ranks.length > 0) {
          sessionStorage.setItem(`${templateId}`, JSON.stringify(r.data));
          window.location.reload();
        } else {
          alert("Data not found");
        }
      })
      .catch(() => alert("Data not found"));
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
    currentColorHeader.style.backgroundColor = e.target.value;
  }
  function textColorHandler(e) {
    setTextColor(e.target.value);
    currentColorText.style.color = e.target.value;
  }

  //TODO resetHandler
  const [resetCount, setResetCount] = useState(0);
  const [resetValue, setResetValue] = useState("Reset");

  function resetTierlistHandler() {
    setResetCount((prev) => prev + 1);
    console.log(resetCount);
    if (resetCount > 0) {
      sessionStorage.removeItem(`${templateId}`);
      getTemplate(templateId);
      window.location.reload();
    } else {
      setResetValue(() => "Sure?");
    }

    setTimeout(() => (setResetCount(0), setResetValue(() => "Reset")), 3000);
  }

  const [PublicName, setPublicName] = useState(() => {
    const name = currentTierList.name;
    return name ? name : "";
  });
  const [PublicDescription, setPublicDescription] = useState(() => {
    const description = currentTierList.description;
    return description ? description : "";
  });
  useEffect(() => {
    if (resetCount >= 0) {
      trySave();
    }
  }, [PublicName, PublicDescription, isVisible]);

  return (
    <>
      <style>{`body{background-color: #fae8e8;}`}</style>
      <div
        style={{
          opacity: isPreviewVisible ? 1 : 0,
          visibility: isPreviewVisible ? "visible" : "hidden",
          transition: "opacity 0.2s linear",
        }}
        className={styles.settingDownloadPage}
      >
        <div className={styles.downloadPageContainer}>
          <div className={styles.downloadExit}>
            <img
              className={styles.downloadExitImage}
              onClick={() => setIsPreviewVisible(false)}
              src={Nekoobs}
            />
          </div>
          <img src={currentSceenshotImage} className={styles.downloadImage} />
          <div className={styles.downloadPageButton}>
            <button
              className={styles.downloadImageButton}
              onClick={() => downloadSceenshot()}
            >
              Dowload Here!
            </button>
          </div>
        </div>
      </div>
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
      <div className={styles.topText}>Tierlist 1.69alpha</div>
      <div className={styles.createContainer}>
        <div className={styles.createNameContainer}>
          <div className={styles.createNameBox}>
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
            <textarea
              value={PublicDescription}
              onChange={(e) => setPublicDescription(e.target.value)}
              placeholder="No description"
              className={styles.createInputDesc}
              name="createDescContainer"
            />
          </div>
        </div>
      </div>
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
                  onKeyUp={() => trySave()}
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
                  // <CandidateImage
                  //   imageUrl={candidate}
                  //   key={`img ${candidateIndex}`}
                  // />

                  <div
                    key={`candidate ${candidateIndex + 1}`}
                    className={styles.candidatesContainer}
                    id={candidateIndex + 1}
                    style={{
                      visibility: "visible",
                      backgroundImage: candidate,
                    }}
                    alt={`candidate ${candidateIndex + 1}`}
                    data-bg-image="true"
                  ></div>
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
            onClick={() => {
              loadTierlistHandler(upLoadText).then(() => {
                window.location.reload();
              });
            }}
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
                  id={candidateindex}
                ></div>
              )
            )}
          </div>
        </div>
      </div>
      <div className={styles.IOContainer}>
        <button
          onClick={() => prePreviewDownload()}
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
      </div>
      <div
        className={styles.tierlistRankPreviewContainer}
        style={{ opacity: "0" }}
      >
        {!takingSceenshot ? null : (
          <div
            className={styles.tierlistRankPreview}
            style={{ visibility: "visible" }}
          >
            {currentPreviewTierList.all_ranks.map((rankObject, index) => (
              <div key={`tierlistRank ${index}`} className={styles.rankPreview}>
                <div
                  style={{
                    backgroundColor: rankObject.background_color,
                    color: rankObject.text_color,
                  }}
                  className={styles.headerPreview}
                >
                  <span
                    onKeyUp={() => trySave()}
                    className={styles.headerTextPreview}
                    contentEditable
                    suppressContentEditableWarning={true}
                  >
                    {rankObject.rank}
                  </span>
                </div>
                <div
                  className={styles.picBoxPreview}
                  //////////Unselected Candidates
                >
                  {rankObject.candidates.map((candidate, candidateIndex) => (
                    <CandidateImage
                      imageUrl={candidate}
                      key={`img ${candidateIndex}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TemplatePage;
