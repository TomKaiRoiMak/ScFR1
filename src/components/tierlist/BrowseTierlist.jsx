import React, { useState, useEffect } from "react";
import styles from "../../modules/tierlistmodules/BrowseTierlist.module.css";
import { Link } from "react-router-dom";
import axios from "axios";
import AllPages from "../AllPages.jsx";

const BrowseTierlist = () => {
  const [templates, setTemplates] = useState([]);
  const [browsePage, setBrowsePage] = useState(() => {
    const browseIntel = sessionStorage.getItem("browseStorage");
    if (browseIntel) {
      return JSON.parse(browseIntel);
    } else {
      return {
        page: 1,
        limit: 10,
      };
    }
  });
  const [limit, setLimit] = useState(browsePage.limit);
  const [page, setPage] = useState(browsePage.page);

  useEffect(() => {
    const browseIntel = { page, limit };
    sessionStorage.setItem("browseStorage", JSON.stringify(browseIntel));
    setBrowsePage(browseIntel);
    getLoadTemplates(page, limit);
  }, [page, limit]);

  function getLoadTemplates(currentPage, currentLimit) {
    axios
      .get(
        `${import.meta.env.VITE_NETWORK_URL}/browseTemplate?limit=${currentLimit}&page=${currentPage}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      )
      .then((r) => {
        setTemplates(r.data);
      })
      .catch(() => console.log("Data not found"));
  }

  function nextPageHandler() {
    setPage((prev) => prev + 1);
  }
  function prevPageHandler() {
    setPage((prev) => Math.max(prev - 1, 1));
  }

  return (
    <>
      <AllPages />
      <style>{`body{background-color: #fae8e8;}`}</style>
      <div className={styles.browseContainer}>
        <div className={styles.browseTextContainer}>
          <h1 className={styles.browseText}>Browse</h1>
        </div>
        <div className={styles.browseTemplates}>
          {templates.map((templates, templates_index) => (
            <Link
              className={styles.browseBox}
              to={`/createTierlist/${templates[0]}`}
              key={templates_index}
            >
              {templates[1]}
            </Link>
          ))}
        </div>
        <div className={styles.pageButtonContainer}>
          <button
            className={styles.pageButton}
            onClick={() => prevPageHandler()}
          >
            Prev
          </button>
          <h1 className={styles.pageText}>{page}</h1>
          <button
            className={styles.pageButton}
            onClick={() => nextPageHandler()}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default BrowseTierlist;
