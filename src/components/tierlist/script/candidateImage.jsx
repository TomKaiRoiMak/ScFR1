import React, { useState, useEffect } from "react";
import styles from "../../../modules/tierlistmodules/CreateTierlist.module.css";
import ImLazy from "../../../assets/tierlist/lazy.png";

const extractURL = (input) => {
  const regex = /url\("(.*)"\)/;
  const match = input.match(regex);
  return match ? match[1] : null;
};

const CandidateImage = ({ imageUrl, imageIndex }) => {
  const [dataUrl, setDataUrl] = useState(null);
  const extractedUrl = extractURL(imageUrl);
  useEffect(() => {
    setDataUrl(extractedUrl);
  }, [extractedUrl]);

  return dataUrl ? (
    <img
      crossOrigin="anonymous"
      src={`${dataUrl}?cachebuster=${new Date().getTime()}`}
      alt={`Candidate ${imageIndex}`}
      loading="lazy"
      className={styles.candidatesContainer}
      style={{ visibility: "visible" }}
    />
  ) : (
    <div></div>
  );
};

export default CandidateImage;
