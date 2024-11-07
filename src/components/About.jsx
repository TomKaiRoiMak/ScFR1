import React from 'react'
import AllPages from './AllPages'
import styles from '../modules/About.module.css'


function About() {
  return (
    <>
    <AllPages/>
    <style>{`body{background-color: #fae8e8;}`}</style>
    <div className={styles.container}>
      <div className={styles.head}>Mathayom 6/10</div><br/>
      <div className={styles.text1}>Homeroom Teacher<br/><div className={styles.text2}>Wannalak Khawbuasar</div></div>
      <div className={styles.text1}>Prez<br/><div className={styles.text2}>Preme Jr.</div></div>
      <div className={styles.text1}>Deputy Prez<br/><div className={styles.text2}>TomKaiRoiMak</div></div>
    </div>
    </>
  )
}

export default About