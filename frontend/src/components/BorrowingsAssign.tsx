import {
  Autocomplete,
  TextField,
  Alert,
  Modal,
  Fade,
} from "@mui/material";
import { customTextFieldStyles } from "../styles/customStyles";
import { useEffect, useState } from "react";
import { document, userBorrowing } from "../types/user";
import axios from "axios";
import styles from "../styles/styles.module.css";
import AssignModalPage from "./AssignModal";
import { useTimedAlert } from "../hooks/useTimedAlert";
import useUserBorrowings from "../hooks/useUserBorrowings";

export default function BorrowingsAssign(props: {
  setBorrowings: any;
  data: document[];
  setData: any;
  setBorrowingsTitles: any;
  setFilteredBorrowings: any;
}) {
  const {
    setBorrowings,
    data,
    setData,
    setBorrowingsTitles,
    setFilteredBorrowings,
  } = props;

  // Alert hook
  const {
    alertMessage,
    countdown,
    showAlert,
    setAlertMessage,
    alertSeverity,
    setAlertSeverity,
  } = useTimedAlert();

  // Variables
  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [id, setId] = useState<any>(""); // This is a number, string here just so it won't show anything in the input.

  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Global variables
  const { setUserBorrowings } = useUserBorrowings() as {
    userBorrowings: userBorrowing[] | null;
    setUserBorrowings: any;
  };

  // Fetch the docs
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8002/getDocs"
        );
        // To only get the titles
        const titles = response.data.map(
          (doc: document) => doc.title
        );
        setData(titles);
        console.log("In stock documents:", response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  // handleAssign
  const handleAssign = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8002/borrowings/assign",
        { id, selectedDoc },
        { withCredentials: true }
      );
      showAlert(response.data.message, "success");

      // Update the docs
      // To get only the titles form the docs object
      const titles = response.data.docs.map(
        (doc: document) => doc?.title
      );
      setData(titles);

      // Update the borrowings
      setBorrowings(response?.data?.activeBorrowings);
      setFilteredBorrowings(response?.data?.activeBorrowings);

      // Update the borrowings titles.
      const borrowingTitles = response?.data?.activeBorrowings?.map(
        (doc: document) => doc?.title
      );

      setBorrowingsTitles(borrowingTitles);

      // Update user borrowings, just in case.
      setUserBorrowings(response?.data?.userBorrowings);

      // Reset values
      setSelectedDoc("");
      setId("");
    } catch (error: any) {
      if (error.response.status === 500) {
        setAlertSeverity("error");
        showAlert(error.response.data.message, "error");
      }
      if (
        error.response.status === 404 ||
        error.response.status === 409
      ) {
        setAlertSeverity("warning");
        showAlert(error.response.data.message, "warning");
      }
    }
  };

  return (
    <div>
      {alertMessage === "User not found in faculty." &&
        alertSeverity && (
          <Alert
            severity={alertSeverity}
            onClose={() => {
              setAlertMessage(null);
              setAlertSeverity(null);
            }}
          >
            {alertMessage}{" "}
            {countdown !== null ? `(${countdown}s)` : ""}{" "}
            <button
              className=" text-uniBlue underline"
              onClick={() => {
                console.log("Add");
                setModalOpen(true);
              }}
            >
              Add them here
            </button>
          </Alert>
        )}

      {alertMessage !== "User not found in faculty." &&
        alertSeverity && (
          <Alert
            severity={alertSeverity}
            onClose={() => {
              setAlertMessage(null);
              setAlertSeverity(null);
            }}
          >
            {alertMessage}{" "}
            {countdown !== null ? `(${countdown}s)` : ""}{" "}
          </Alert>
        )}

      {/* The assign form */}
      <div className=" flex justify-center">
        <form
          method="POST"
          className={styles.assignForm}
          onSubmit={handleAssign}
        >
          <h3 className="sm:text-2xl text-xl font-normal text-gray-700 mb-4 text-center">
            Assign Borrowings
          </h3>
          {/* 👇 The width here is what needs adjusting for responsive */}
          {/* ISBN or title */}
          <div className=" flex flex-col w-3/4">
            <Autocomplete
              value={selectedDoc}
              disablePortal
              freeSolo={true}
              size="small"
              options={data}
              sx={customTextFieldStyles}
              onChange={(event: any, newValue: any) => {
                if (newValue) {
                  setSelectedDoc(newValue);
                }
              }}
              onInputChange={(event: any, newInputValue: string) => {
                setSelectedDoc(newInputValue);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevents accidental multi-line input
                  (e.target as HTMLFormElement).form?.requestSubmit(); // Submits the form
                }
              }}
              renderInput={(params) => (
                <TextField
                  required
                  variant="standard"
                  {...params}
                  label="Enter a Title or ISBN"
                />
              )}
            />
          </div>
          {/* 👇 The width here is what needs adjusting for responsive */}
          {/* User Id */}
          <div className=" flex flex-col space-y-1 w-3/4">
            <TextField
              required
              sx={customTextFieldStyles}
              className=" w-full"
              label="Enter an ID.No"
              value={id}
              size="small"
              type="number"
              variant="standard"
              onChange={(e) => {
                setId(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLFormElement).form?.requestSubmit(); // Submits the form
                }
              }}
            />
          </div>
          {/* Submit */}
          <button type="submit" className={styles.submitBtn}>
            Assign
          </button>
        </form>
        {/* <button
          onClick={() => {
            console.log(id, selectedDoc);
          }}
        >
          log
        </button> */}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Fade in={modalOpen}>
          <div>
            <AssignModalPage
              //👇 props
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              userId={id}
              setAlertMessage={setAlertMessage}
              setAlertSeverity={setAlertSeverity}
            />
          </div>
        </Fade>
      </Modal>
    </div>
  );
}
