import styles from "../../modules/tierlistmodules/Tierlist.module.css";
import nekoobs from "../../assets/Liu_NoBg.png";
import tierlistSample from "../../assets/tierlist/tierlistSample.png";
import { Link } from "react-router-dom";
import AllPages from "../AllPages.jsx";

const Tierlist = () => {
  return (
    <>
      <style>{`body{background-color: #fae8e8;}`}</style>
      {/* <div className={styles.background}>
        <h1 className={styles.topText}>Tierlist 6.9 I'm so lazy!</h1>
        <img src={nekoobs} className={styles.NavigatorImage} />
      </div> */}
      <AllPages />
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
          <Link to={"/BrowseTierlist"} className={styles.createTierlist}>
            Browse
          </Link>
        </div>
      </div>
    </>
  );
};

export default Tierlist;
