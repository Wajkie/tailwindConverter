import styles from "./alertBanner_test.module.scss";
export default function AlertBanner() {
  return <div className={styles["div_nth-of-type_1"]}>
      <div className={`${styles["div_nth-of-type_2"]} border-green-400 text-green-700 unknown-slide-in`}>
        <strong className={styles["strong"]}>Success!</strong>
        <span className={styles["span_nth-of-type_1"]}>Your changes have been saved.</span>
      </div>
      
      <div className={`${styles["div_nth-of-type_3"]} border-yellow-400 text-yellow-700`}>
        <strong className={`${styles["strong_nth-of-type_2"]} unknown-blink`}>Warning!</strong>
        <span className={styles["span_nth-of-type_2"]}>Please review your information.</span>
      </div>
      
      <div className={`${styles["div_nth-of-type_4"]} border-red-400 text-red-700 unknown-shake`}>
        <strong className={styles["strong_nth-of-type_3"]}>Error!</strong>
        <span className={styles["span_nth-of-type_3"]}>Something went wrong.</span>
      </div>
      
      <div className={`${styles["div_nth-of-type_5"]} border-blue-400`}>
        <strong className={styles["strong_nth-of-type_4"]}>Info!</strong>
        <span className={`${styles["span_nth-of-type_4"]} unknown-italic-bold`}>Check out our new features.</span>
      </div>
    </div>;
}