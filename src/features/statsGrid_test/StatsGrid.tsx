import styles from "./statsGrid_test.module.scss";
export default function StatsGrid() {
  return <div className={styles["div_nth-of-type_1"]}>
      <h2 className={`${styles["h2"]} mb-8 unknown-shimmer`}>Statistics</h2>
      <div className={styles["div_nth-of-type_2"]}>
        <div className={`${styles["div_nth-of-type_3"]} unknown-hover-lift`}>
          <div className={styles["div_nth-of-type_4"]}>12.5K</div>
          <div className={styles["div_nth-of-type_5"]}>Users</div>
        </div>
        <div className={styles["div_nth-of-type_6"]}>
          <div className={`${styles["div_nth-of-type_7"]} unknown-counter`}>350</div>
          <div className={styles["div_nth-of-type_8"]}>Projects</div>
        </div>
        <div className={styles["div_nth-of-type_9"]}>
          <div className={styles["div_nth-of-type_10"]}>98%</div>
          <div className={`${styles["div_nth-of-type_11"]} unknown-small-caps`}>Success Rate</div>
        </div>
        <div className={`${styles["div_nth-of-type_12"]} unknown-glow-border`}>
          <div className={styles["div_nth-of-type_13"]}>24/7</div>
          <div className={styles["div_nth-of-type_14"]}>Support</div>
        </div>
      </div>
    </div>;
}