import { Link } from "react-router-dom";
import styles from "../styles/styles.module.css";
export default function NotFound() {
  return (
    <div className=" h-screen flex justify-center items-center">
      <h1>
        This page does not exist, go back{" "}
        <Link className={styles.link} to="/">
          Home
        </Link>
      </h1>
    </div>
  );
}