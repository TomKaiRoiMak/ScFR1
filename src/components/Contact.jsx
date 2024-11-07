import AllPages from "./AllPages";
import styles from "../modules/Contact.module.css";

function Contact() {
  return (
    <>
      <AllPages />
    <style>{`body{background-color: #fae8e8;}`}</style>
      <div className={styles.text}>
        <div className={styles.textIn}>Thank to 🙏🙏🙏</div>
        <br />
        <div className={styles.textIn}>
          TomKaiRoiMak <br />
          <div className={styles.textIn2}> phuphababyboy@gmail.com</div>
        </div>
        <br />
        <div className={styles.textIn}>
          Nekoobs <br />
          <div className={styles.textIn2}> stevejerkson@gmail.com</div>
        </div>
        <br />
        <div className={styles.textIn}>
          For making this website possible <br />
          <br />
          👾👾👾
        </div>
        <br />
      </div>
    </>
  );
}

export default Contact;
