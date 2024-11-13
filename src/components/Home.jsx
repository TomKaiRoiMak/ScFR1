import React, { useEffect, useState } from "react";
import AllPages from "./AllPages";
import QRCode from "../assets/QRCode.jpg";
import styles from "../modules/Home.module.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <AllPages />
      <style>{`body{background-color: #fae8e8;}`}</style>
      <div>
        <div className={styles.container}>
          <Link to="/Tierlist" className={styles.linkContainer}>
            Tierlist
          </Link>
        </div>
      </div>
      <div className={styles.imgContainer}>
        
      </div>
    </>
  );
}

export default Home;
