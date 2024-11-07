import styles from "../../modules/tierlistmodules/Tierlist.module.css";
import nekoobs from "../../assets/Liu_NoBg.png";
import tierlistSample from "../../assets/tierlist/tierlistSample.png";
import { Link } from "react-router-dom";
import React, { useState } from "react";

const Tierlist = () => {
  const [templates, setTemplates] = useState([
    {
      id: "hQXvgl",
      name: "Anime Characters",
      description: "Rank your favorite anime characters!",
    },
    {
      id: "MRyBRC",
      name: "Video Game Weapons",
      description: "Rank the best weapons in video games!",
    },
    {
      id: "GkdTY0",
      name: "Video Game Weapons",
      description: "Rank the best weapons in video games!",
    },
  ]);
  return (
    <>
      <style>{`body{background-color: #fae8e8;}`}</style>
      <div className={styles.background}>
        <h1 className={styles.topText}>Tierlist 6.9 I'm lazy as fuck!</h1>
        <img src={nekoobs} className={styles.NavigatorImage} />
      </div>
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.firstText}>Make Your Own Tierlist!!!</div>
          <div className={styles.tierlistSampleContainer}>
            <img src={tierlistSample} className={styles.tierlistSampleImage} />
          </div>
          <div className={styles.secondText}>Create one Now!</div>
          <div className={styles.createTierlistContainer}>
            <Link to="/createTierlist" className={styles.createTierlist}>
              Create Tierlist
            </Link>
          </div>
          <div className={styles.secondText}>Browse Now!</div>
          <div className={styles.templateList}>
            {templates.map((template) => (
              <Link
                key={template.id}
                to={`/CreateTierlist/${template.id}`}
                className={styles.createTierlist}
              >
                {template.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tierlist;
