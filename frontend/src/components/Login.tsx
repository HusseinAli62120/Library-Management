import axios from "axios";
import { useState } from "react";
import { error, user } from "../types/user";
import { Link, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { TextField, InputAdornment } from "@mui/material";
import styles from "../styles/styles.module.css";
import { customTextFieldStyles } from "../styles/customStyles";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  // const [emailError, setEmailError] = useState<boolean>(false);
  // const [emailErrorText, setEmailErrorText] = useState<string>("");

  const [password, setPasword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // const [passwordError, setPasswordError] = useState<boolean>(false);
  // const [passwordErrorText, setPasswordErrorText] =
  //   useState<string>("");

  const [error, setError] = useState<error>({
    isError: false,
    message: "",
  });

  const { userData, setUserData } = useAuth() as {
    userData: user;
    setUserData: any;
  };

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault(); // This prevents the page from reloading, and makes sure everything works smoothly.
    try {
      // setEmailError(false);
      // setPasswordError(false);

      setError(() => {
        return { isError: false, message: "" };
      });
      const response = await axios.post(
        "http://localhost:8002/login",
        { email, password },
        { withCredentials: true }
      );
      // Here we are setting the data from the backend to global states to be used elsewhere.
      setUserData(() => {
        return {
          accessToken: response.data.accessToken,
          email: response.data.email,
          role: response.data.role,
        };
      });
    } catch (error: any) {
      if (error.response) {
        // if (error.response.status === 404) {
        //   console.log(error.response.data.message); // User does not exist
        //   setEmailError(true);
        //   setEmailErrorText(error.response.data.message);
        // }
        // if (error.response.status === 401) {
        //   console.log(error.response.data.message); // Incorrect password
        //   setPasswordError(true);
        //   setPasswordErrorText(error.response.data.message);
        // }
        setError(() => {
          return {
            isError: true,
            message: "Incorrect Email or Password.",
          };
        });
      } else {
        console.error("An unexpected error occurred.");
      }
    }
  };

  if (!userData) {
    // Show this page only if there is no logged in user.
    return (
      <div className=" h-screen flex justify-center items-center">
        <div className={styles.signup_container}>
          <div className={styles.left}>
            <p className=" text-white md:text-2xl text-lg my-3">
              Create an account
            </p>
            <Link to={"/signup"} className={styles.signDirectBtn}>
              Sign Up
            </Link>
          </div>
          <form
            className={styles.right}
            action="POST"
            onSubmit={handleLogin}
          >
            <p className="lg:text-4xl md:text-2xl text-lg">
              Welcome Back
            </p>
            <TextField
              sx={customTextFieldStyles}
              style={{ width: "60%" }}
              label="Email"
              name="email"
              value={email}
              size="small"
              variant="outlined"
              type="email"
              // error={emailError}
              // helperText={`${emailError ? emailErrorText : ""}`}
              error={error.isError}
              helperText={`${error.isError ? error.message : ""}`}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              sx={customTextFieldStyles}
              style={{ width: "60%" }}
              label="Password"
              value={password}
              size="small"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              // error={passwordError}
              // helperText={`${passwordError ? passwordErrorText : ""}`}
              error={error.isError}
              helperText={`${error.isError ? error.message : ""}`}
              onChange={(e) => {
                setPasword(e.target.value);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <button
                        onClick={(e) => {
                          e.preventDefault(); // This prevents the button click here from triggering the form action.
                          setShowPassword(!showPassword);
                        }}
                      >
                        <VisibilityIcon
                          fontSize="small"
                          sx={{ color: "#2e439d" }}
                        />
                      </button>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {/* We change this button and make one with a gradient of the colors we chose */}
            <button className={styles.submitBtn} type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }
  return <Navigate to="/" />;
}
