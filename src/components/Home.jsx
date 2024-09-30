import React from 'react'
import AllPages from './AllPages'
import QRCode from '../assets/QRCode.jpg'
import styles from '../modules/Home.module.css'
import { Link } from 'react-router-dom'




function Home (){
  return (
    <>
      <AllPages/>
      <div className={styles.container}>
        <Link to='/Tierlist' className={styles.tierList}>Tierlist!</Link>
      </div>
      <div className={styles.imgContainer}>
        <a href='https://www.youtube.com/watch?v=ejlOaw_Sdtg'><img src={QRCode} className={styles.qrCode}/></a>
      </div>
      </>
  );
}
export default Home;