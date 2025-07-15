import { TextField } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import styles from "../styles/styles.module.css";
import { useState } from "react";
import axios from "axios";
import { error } from "../types/user";

export default function DocDeleteModal(props: {
  setModalOpen: any;
  setDocuments: any;
  setFilteredDocuments: any;
  showAlert: any;
  id: number | undefined;
  url: string;
}) {
  const {
    setModalOpen,
    setDocuments,
    setFilteredDocuments,
    id,
    url,
    showAlert,
  } = props;
  // Variables
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<error>({
    isError: false,
    message: "",
  });

  const deleteDocument = async (
    id: number | undefined,
    url: string
  ) => {
    if (value === "DELETE") {
      try {
        console.log("delete");

        const response = await axios.delete(
          "http://localhost:8002/deleteDoc",
          {
            data: {
              id,
              url,
            },
          }
        );
        // Update the files without useEffect.
        setDocuments(response.data.updatedDocs);
        setFilteredDocuments(response.data.updatedDocs);

        // Show feedback
        showAlert(response.data.message, "success");

        // Close modal and reset error
        setModalOpen(false);
        setError(() => {
          return {
            isError: true,
            message: "Please enter the input label",
          };
        });
      } catch (error: any) {
        showAlert(error.response.data.message, "error");
      }
    } else {
      setError(() => {
        return {
          isError: true,
          message: "Please enter the input label",
        };
      });
    }
  };
  return (
    <div>
      <div className={`${styles.Modal} py-10`}>
        <h4>Type the label to confirm deletion.</h4>
        <TextField
          label="DELETE"
          value={value}
          size="small"
          color="error"
          error={error.isError}
          helperText={error.isError ? error.message : ""}
          variant="outlined"
          onChange={(e: any) => {
            setValue(e.target.value);
            setError(() => {
              return {
                isError: false,
                message: "",
              };
            });
          }}
        />

        <button
          onClick={() => {
            deleteDocument(id, url);
          }}
          color="error"
        >
          <div className={styles.deleteBtn}>
            <p>Delete</p>
            <DeleteOutlineIcon />
          </div>
        </button>
      </div>
    </div>
  );
}
