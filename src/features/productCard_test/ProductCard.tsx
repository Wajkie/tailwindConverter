import styles from "./productCard_test.module.scss";
export default function ProductCard() {
  return <div className={styles["div_nth-of-type_1"]}>
      <img src="https://via.placeholder.com/400x300" alt="Product" className={`${styles["img"]} unknown-image-filter`} />
      <div className={styles["div_nth-of-type_2"]}>
        <h2 className={styles["h2"]}>Premium Product</h2>
        <p className={`${styles["p_nth-of-type_1"]} unknown-line-clamp-3`}>
          This is a premium product with excellent quality and great features.
        </p>
        <div className={styles["div_nth-of-type_3"]}>
          <span className={styles["span_nth-of-type_1"]}>$99.99</span>
          <button className={`${styles["button"]} unknown-animate-bounce`}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>;
}