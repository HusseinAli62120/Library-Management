import axios from "axios";
import { useEffect, useState } from "react";
import { error, user } from "../types/user";
import { Link, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { InputAdornment, TextField } from "@mui/material";
import styles from "../styles/styles.module.css";
import { customTextFieldStyles } from "../styles/customStyles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SendIcon from "@mui/icons-material/Send";

export default function SignUp() {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<error>({
    isError: false,
    message: "",
  });

  const [password, setPasword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<error>({
    isError: false,
    message: "",
  });

  const [vericode, setVeriCode] = useState<string>("");
  const [codeError, setCodeError] = useState<error>({
    isError: false,
    message: "",
  });
  const [codeMess, setCodeMess] = useState({
    show: false,
    message: "",
  }); // To show messages related to the code, valid email, sent.
  const [token, setToken] = useState<string>(""); // This is used to store the sent verification code in a secure manner, and because it persists. If we used the memory in the backend, it would not persist.

  const [timer, setTimer] = useState(0); // how many seconds left
  const [isCounting, setIsCounting] = useState(false); // is countdown running

  const { userData, setUserData } = useAuth() as {
    userData: user;
    setUserData: any;
  };
  // To enforce the college domain
  const emailRegex = /^[a-zA-Z0-9._%+-]+@coeng\.uobaghdad\.edu\.iq$/;

  // Send Verification code
  const sendCode = async () => {
    if (emailRegex.test(email)) {
      try {
        // Call your backend to send the code
        const response = await axios.post(
          "http://localhost:8002/sendCode",
          { email }
        );
        setToken(response.data.token);
        setIsCounting(true);
        setTimer(60); // 60 seconds
        setCodeMess(() => {
          return {
            message: "Error sending verification code.",
            show: false,
          };
        });
      } catch (error) {
        console.error("Failed to send code", error);
        // alert("Error sending verification code.");
        setCodeMess(() => {
          return {
            message: "Error sending verification code.",
            show: true,
          };
        });
      }
    } else {
      setCodeMess(() => {
        return {
          message: "Please enter valid email",
          show: true,
        };
      });
    }
  };

  useEffect(() => {
    if (isCounting && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsCounting(false);
    }
  }, [isCounting, timer]);

  const handleSignup = async (e: { preventDefault: () => void }) => {
    e.preventDefault(); // This prevents the page from reloading, and makes sure everything works smoothly.
    // We reset the the warnings so that they don't persist, if fixed.
    setEmailError(() => {
      return {
        isError: false,
        message: "",
      };
    });
    setPasswordError(() => {
      return {
        isError: false,
        message: "",
      };
    });
    setCodeError(() => {
      return {
        isError: false,
        message: "",
      };
    });

    if (emailRegex.test(email)) {
      if (password.length >= 8) {
        if (vericode.length === 6) {
          try {
            const response = await axios.post(
              "http://localhost:8002/signup",
              {
                email,
                password,
                vericode,
                token,
              },
              { withCredentials: true }
            );
            console.log(response);

            // Here we are setting the data from the backend to global states to be used elsewhere.
            setUserData(() => {
              return {
                accessToken: response.data.accessToken,
                email: response.data.email,
                role: response.data.role,
              };
            });
          } catch (error: any) {
            console.log(error);
            if (error.response) {
              if (error.response.status === 409) {
                // The email already exists.
                console.log(error.response.data.message);
                setEmailError(() => {
                  return {
                    isError: true,
                    message: error.response.data.message,
                  };
                });
              }
              if (error.response.status === 401) {
                // The code does not match
                console.log(error.response.data.message);
                setCodeError(() => {
                  return {
                    isError: true,
                    message: error.response.data.message,
                  };
                });
              }
            }
          }
        } else {
          setCodeError(() => {
            return {
              isError: true,
              message: "Invalid Code",
            };
          });
        }
      } else {
        setPasswordError(() => {
          return {
            isError: true,
            message: "Password must be at least 8 characters",
          };
        });
      }
    } else {
      setEmailError(() => {
        return {
          isError: true,
          message: "Email is not allowed. Please use college email",
        };
      });
    }
  };

  if (!userData) {
    // Show this page only if there is no logged in user.
    return (
      <div className=" h-screen flex justify-center items-center">
        <div className={styles.signup_container}>
          <div className={styles.left}>
            <p className=" text-white md:text-2xl text-lg my-3">
              Already have an account?
            </p>
            <Link to={"/login"} className={styles.signDirectBtn}>
              Login
            </Link>
          </div>
          <form
            className={styles.right}
            action="POST"
            onSubmit={handleSignup}
          >
            <p className="lg:text-4xl md:text-2xl text-lg">
              Create an account
            </p>
            <TextField
              required
              style={{ width: "60%" }}
              sx={customTextFieldStyles}
              label="Email"
              name="email"
              value={email}
              size="small"
              variant="outlined"
              type="email"
              error={emailError.isError}
              helperText={`${
                emailError.isError ? emailError.message : ""
              }`}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <TextField
              required
              style={{ width: "60%" }}
              sx={customTextFieldStyles}
              label="Password"
              value={password}
              size="small"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              error={passwordError.isError}
              helperText={`${
                passwordError.isError ? passwordError.message : ""
              }`}
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
              onChange={(e) => {
                setPasword(e.target.value);
              }}
            />
            <TextField
              required
              style={{ width: "60%" }}
              sx={customTextFieldStyles}
              label="Verification code"
              value={vericode}
              size="small"
              variant="outlined"
              type="text"
              error={codeError.isError}
              helperText={`${
                codeError.isError ? codeError.message : ""
              }`}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {isCounting ? (
                        <span
                          style={{
                            color: "#2e439d",
                            fontSize: "0.8rem",
                          }}
                        >
                          {timer}s
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            sendCode();
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <SendIcon
                            fontSize="small"
                            sx={{ color: "#2e439d" }}
                          />
                        </button>
                      )}
                    </InputAdornment>
                  ),
                },
              }}
              onChange={(e) => {
                setVeriCode(e.target.value);
              }}
            />
            {token && (
              <p
                style={{
                  color: "#2e439d",
                  fontSize: "0.8rem",
                  marginTop: "5px",
                }}
              >
                Code has been sent to your email.
              </p>
            )}
            {codeMess?.show && (
              <p
                style={{
                  color: "#2e439d",
                  fontSize: "0.8rem",
                  marginTop: "5px",
                }}
              >
                {codeMess?.message}
              </p>
            )}
            <button
              disabled={token ? false : true} // Only after we received a code can we attempt to sign up.
              className={styles.submitBtn}
              type="submit"
            >
              Sign up
            </button>
          </form>
        </div>
      </div>
    );
  }
  return <Navigate to="/" />;
}
