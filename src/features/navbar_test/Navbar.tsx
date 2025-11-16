import styles from "./navbar_test.module.scss";
export default function Navbar() {
  return <nav className={`${styles["nav"]} unknown-sticky-top`}>
      <div className={styles["div_nth-of-type_1"]}>
        <div className={`${styles["div_nth-of-type_2"]} unknown-gradient-text`}>MyBrand</div>
        <ul className={`${styles["ul_nth-of-type_1"]} space-x-6`}>
          <li><a href="#" className={`${styles["a_nth-of-type_1"]} unknown-smooth-transition`}>Home</a></li>
          <li><a href="#" className={styles["a_nth-of-type_2"]}>About</a></li>
          <li><a href="#" className={styles["a_nth-of-type_3"]}>Products</a></li>
          <li><a href="#" className={`${styles["a_nth-of-type_4"]} unknown-highlight`}>Contact</a></li>
        </ul>
        <button className={styles["button"]}>
          Get Started
        </button>
      </div>
    </nav>;
}