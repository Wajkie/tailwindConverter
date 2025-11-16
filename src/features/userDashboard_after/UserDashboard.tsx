import styles from "./userDashboard_test.module.scss";
export default function UserDashboard() {
  return <div className={styles["div_nth-of-type_1"]}>
      <header className={styles["header"]}>
        <h1 className={styles["h1"]}>User Dashboard</h1>
        <button className={styles["button"]}>
          Logout
        </button>
      </header>
      
      <main className={styles["main"]}>
        <div className={styles["div_nth-of-type_2"]}>
          <div className={styles["div_nth-of-type_3"]}>
            <h3 className={styles["h3"]}>Total Users</h3>
            <p className={styles["p_nth-of-type_1"]}>1,234</p>
          </div>
          <div className={styles["div_nth-of-type_4"]}>
            <h3 className={styles["h3_nth-of-type_2"]}>Active Now</h3>
            <p className={styles["p_nth-of-type_2"]}>89</p>
          </div>
          <div className={styles["div_nth-of-type_5"]}>
            <h3 className={styles["h3_nth-of-type_3"]}>New Today</h3>
            <p className={styles["p_nth-of-type_3"]}>23</p>
          </div>
        </div>
        
        <div className={styles["div_nth-of-type_6"]}>
          <h2 className={styles["h2"]}>Recent Activity</h2>
          <ul className={styles["ul_nth-of-type_1"]}>
            <li className={styles["li_nth-of-type_1"]}>
              John joined the platform
            </li>
            <li className={styles["li_nth-of-type_2"]}>
              Sarah updated her profile
            </li>
            <li className={styles["li_nth-of-type_3"]}>
              Mike posted a new comment
            </li>
          </ul>
        </div>
      </main>
    </div>;
}