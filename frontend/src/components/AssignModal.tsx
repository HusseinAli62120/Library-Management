import { TextField, Autocomplete } from "@mui/material";
import styles from "../styles/styles.module.css";
import { customTextFieldStyles } from "../styles/customStyles";
import { useState } from "react";
import axios from "../api/axios";
import { error } from "../types/user";

export default function AssignModalPage(props: any) {
  const {
    modalOpen,
    setModalOpen,
    userId,
    setAlertMessage,
    setAlertSeverity,
  } = props;
  const [role, setRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<error>({
    isError: false,
    message: "",
  });
  const roles = ["Under-Graduate", "Professor"];

  const emailRegex = /^[a-zA-Z0-9._%+-]+@coeng\.uobaghdad\.edu\.iq$/;

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (emailRegex.test(email)) {
      try {
        const response = await axios.post(
          "http://localhost:8002/addUser",
          { role, email, userId },
          { withCredentials: true }
        );
        console.log(response.data);
        // Close the modal and the alert message
        setModalOpen(!modalOpen);
        setAlertMessage(null);
        setAlertSeverity(null);
      } catch (error: any) {
        console.log(error.response);
      }
    } else {
      console.log("Incorrect email");
      setEmailError(() => {
        return { isError: true, message: "Invalid Email" };
      });
    }
  };
  return (
    <div>
      <div className={`${styles.Modal}`}>
        <h4>Add user to faculty.</h4>
        <form
          className={`${styles?.assignModalForm}`}
          method="POST"
          onSubmit={handleSubmit}
        >
          {/* Email */}
          <TextField
            required
            style={{ width: "100%" }}
            label="Email"
            value={email}
            size="small"
            variant="outlined"
            error={emailError?.isError}
            helperText={emailError ? emailError?.message : ""}
            sx={customTextFieldStyles}
            onChange={(e: any) => {
              setEmail(e.target.value);
            }}
          />
          {/* Card Id */}
          <TextField
            required
            style={{ width: "100%" }}
            label="CardId"
            value={userId}
            size="small"
            variant="outlined"
            sx={customTextFieldStyles}
          />
          {/* Role */}
          <Autocomplete
            value={role}
            disablePortal
            style={{ width: "100%" }}
            size="small"
            options={roles}
            sx={customTextFieldStyles}
            onChange={(event: any, newValue: any) => {
              if (newValue) {
                setRole(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                required
                variant="outlined"
                {...params}
                label="Select Role"
              />
            )}
          />
          <button className={styles.submitBtn} type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
