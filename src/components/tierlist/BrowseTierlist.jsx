import React, { useState, useEffect } from "react";
import styles from "../../modules/tierlistmodules/BrowseTierlist.module.css";
import { Link } from "react-router-dom";
import axios from "axios";

const BrowseTierlist = () => {

  const [templates, setTemplates] = useState([


  ]);
  const [query, setQuery] = useState(20);

  useEffect(() => {
    getLoadTemplates();
  }, []);

  function getLoadTemplates() {
    axios
      .get(`http://127.0.0.1:4000/browseTemplate?limit=${query}`, {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      })
      .then((r) => {
        setTemplates(r.data)
      })
      .catch(() => console.log("Data not found"));
  }

  return (
    <>
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
      </div>
    </>
  );
};

export default BrowseTierlist;
