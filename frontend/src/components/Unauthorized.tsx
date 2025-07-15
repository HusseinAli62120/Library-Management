import { Link } from "react-router-dom";
import styles from "../styles/styles.module.css";
export default function Unauthorized() {
  return (
    <div className=" h-screen flex justify-center items-center">
      <h1>
        You are Unauthorized to access this page, please go back
        <Link className={styles.link} to="/">
          {" " + "Home"}
        </Link>
      </h1>
    </div>
  );
}
