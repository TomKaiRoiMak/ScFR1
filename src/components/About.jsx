import React from 'react'
import AllPages from './AllPages'
import styles from '../modules/About.module.css'


function About() {
  return (
    <>
    <AllPages/>
    <div className={styles.container}>
      <h className={styles.head}>Mathayom 6/10</h><br/>
      <h className={styles.text1}>Homeroom Teacher<br/><h className={styles.text2}>Wannalak Khawbuasar</h></h>
      <h className={styles.text1}>Prez<br/><h className={styles.text2}>Preme Jr.</h></h>
      <h className={styles.text1}>Deputy Prez<br/><h className={styles.text2}>TomKaiRoiMak</h></h>
    </div>
    </>
  )
}

export default About