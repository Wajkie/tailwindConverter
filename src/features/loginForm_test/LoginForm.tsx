import styles from "./loginForm_test.module.scss";
export default function LoginForm() {
  return <div className={`${styles["div_nth-of-type_1"]} unknown-backdrop-blur`}>
      <div className={styles["div_nth-of-type_2"]}>
        <h1 className={`${styles["h1"]} mb-6`}>Login</h1>
        <form className={styles["form"]}>
          <div>
            <label className={styles["label"]}>Email</label>
            <input type="email" className={`${styles["input"]} focus:outline-none unknown-input-glow`} placeholder="you@example.com" />
          </div>
          <div>
            <label className={styles["label_nth-of-type_2"]}>Password</label>
            <input type="password" className={`${styles["input_nth-of-type_2"]} focus:outline-none`} placeholder="••••••••" />
          </div>
          <button className={`${styles["button"]} unknown-pulse`}>
            Sign In
          </button>
        </form>
      </div>
    </div>;
}