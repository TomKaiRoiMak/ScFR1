import React from "react";
import { Link } from "react-router-dom";
import styles from "../modules/AllPages.module.css";
import Logo from "../assets/SKR-Logo.png";

function AllPages() {
  return (
    <>
      <div className={styles.Top}>
        <a href="https://sakolraj.ac.th">
          <img src={Logo} className={styles.logoImage} alt="Logo" />
        </a>
        <Link to="/" className={styles.menuButton}>
          Home
        </Link>
        <Link to="/About" className={styles.menuButton}>
          About
        </Link>
        <Link to="/Contact" className={styles.menuButton}>
          Contact
        </Link>
      </div>
    </>
  );
}

export default AllPages;
