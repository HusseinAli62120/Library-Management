import {
  Alert,
  Autocomplete,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import styles from "../styles/styles.module.css";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import {
  borrowing,
  document,
  error,
  user,
  userBorrowing,
} from "../types/user";
import { Navigate } from "react-router-dom";
import { customTextFieldStyles } from "../styles/customStyles";
import axios from "axios";
import { useTimedAlert } from "../hooks/useTimedAlert";
import useUserBorrowings from "../hooks/useUserBorrowings";

export default function BorrowingsResolve(props: {
  borrowings: borrowing[];
  setBorrowings: any;
  setData: any;
  borrowingsTitles: string[];
  setBorrowingsTitles: any;
  filteredBorrowings: borrowing[];
  setFilteredBorrowings: any;
}) {
  const {
    borrowings,
    setBorrowings,
    setData,
    borrowingsTitles,
    setBorrowingsTitles,
    filteredBorrowings,
    setFilteredBorrowings,
  } = props;

  // Custom hook
  const { alertMessage, countdown, showAlert, setAlertMessage } =
    useTimedAlert();

  // Variables
  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [cardId, setCardId] = useState<string>("");
  const [idError, setIdError] = useState<error>({
    isError: false,
    message: "",
  });

  // Global variable
  const { userData } = useAuth() as {
    userData: user;
  };

  const { setUserBorrowings } = useUserBorrowings() as {
    userBorrowings: userBorrowing[] | null;
    setUserBorrowings: any;
  };

  // Get active borrowings.
  useEffect(() => {
    const getBorrowings = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8002/borrowings/getBorrowings"
        );

        // For the autocomplete.
        const titles = response.data.map(
          (doc: borrowing) => doc?.title
        );
        setBorrowingsTitles(titles);

        // The borrowings info.
        setBorrowings(response.data);
        setFilteredBorrowings(response?.data); // Initialize the filtered borrowings

        console.log("Active borrowings:", response.data);
      } catch (error: any) {
        console.log(error.response);
      }
    };
    getBorrowings();
  }, []);

  // Button resolve
  const handleResolve = async (
    faculty_id: number,
    data_id: number
  ) => {
    try {
      const response = await axios.put(
        "http://localhost:8002/borrowings/btnResolve",
        { faculty_id, data_id },
        { withCredentials: true }
      );
      console.log(response?.data);

      // Send feedback
      showAlert(response.data.message, "success");

      // Update the borrowings
      setBorrowings(response?.data?.borrowings);
      setFilteredBorrowings(response?.data?.borrowings);

      // Update the borrowings titles.
      const borrowingTitles = response?.data?.borrowings.map(
        (doc: document) => doc?.title
      );

      setBorrowingsTitles(borrowingTitles);

      // Update the data
      const titles = response?.data?.docs.map(
        (doc: document) => doc.title
      );
      setData(titles);

      // Update user borrowings
      setUserBorrowings(response?.data?.userBorrowings);

      // Reset values
      setCardId("");
      setSelectedDoc("");
      setSort("");
      setIdError(() => {
        return {
          isError: false,
          message: "",
        };
      });
    } catch (error: any) {
      if (error.response) {
        console.log(error.response);
      }
    }
  };

  // Scan resolve
  const scanResolve = async (e: any) => {
    if (
      (cardId.length === 5 && e.key === "Enter") ||
      (cardId.length === 5 &&
        (selectedDoc.length === 10 || selectedDoc.length === 13))
    ) {
      console.log("enter");

      try {
        const response = await axios.put(
          "http://localhost:8002/borrowings/scanResolve",
          { cardId, selectedDoc },
          { withCredentials: true }
        );
        console.log(response?.data);

        // Send feedback
        showAlert(response.data.message, "success");

        // Update the borrowings array.
        setBorrowings(response?.data?.borrowings);
        setFilteredBorrowings(response?.data?.borrowings);

        // Update the borrowings titles.
        const borrowingTitles = response?.data?.borrowings.map(
          (doc: document) => doc?.title
        );

        setBorrowingsTitles(borrowingTitles);

        // Update the data
        const titles = response?.data?.docs.map(
          (doc: document) => doc.title
        );
        setData(titles);

        // Update user borrowings
        setUserBorrowings(response?.data?.userBorrowings);

        // Reset values
        setCardId("");
        setSelectedDoc("");
        setSort("");
        setIdError(() => {
          return {
            isError: false,
            message: "",
          };
        });
      } catch (error: any) {
        if (error.response.status === 404) {
          setIdError(() => {
            return {
              isError: true,
              message: error.response.data.message,
            };
          });
        }
        if (error.response.status === 500) {
          setIdError(() => {
            return {
              isError: true,
              message: error.response.data.message,
            };
          });
        }
      }
    }
  };

  // Function to handle sorting by title
  const sortByTitle = (order: string) => {
    const sorted = [...borrowings].sort((a, b) => {
      if (order === "Ascending") {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    setFilteredBorrowings(sorted);
  };

  // Function to handle sorting by email
  const sortByEmail = (order: string) => {
    const sorted = [...borrowings].sort((a, b) => {
      if (order === "emailAscending") {
        return a.email.localeCompare(b.email);
      } else {
        return b.email.localeCompare(a.email);
      }
    });
    setFilteredBorrowings(sorted);
  };

  // Handle changes to sorting criteria
  useEffect(() => {
    if (sort === "Ascending" || sort === "Descending") {
      sortByTitle(sort);
    } else {
      sortByEmail(sort);
    }
  }, [sort]);

  if (userData?.accessToken) {
    return (
      <div className=" flex flex-col">
        {alertMessage && (
          <Alert
            onClose={() => {
              setAlertMessage("");
            }}
            severity="success"
          >
            {alertMessage}{" "}
            {countdown !== null ? `(${countdown}s)` : ""}
          </Alert>
        )}
        <div className="flex md:px-4 px-1 w-full overflow-x-hidden ">
          {/* Left */}
          <div className=" flex flex-col space-y-5 py-8 sm:w-3/12 w-4/12 border-t bg-[#f5f9ff]">
            {/* Card ID */}
            <div className=" sm:w-4/5 w-full">
              <TextField
                sx={customTextFieldStyles}
                style={{ width: "100%" }}
                label="Card ID"
                value={cardId}
                type="number"
                size="small"
                variant="outlined"
                onChange={(e: any) => {
                  setCardId(e.target.value);
                  setAlertMessage("");
                  setIdError(() => {
                    return {
                      isError: false,
                      message: "",
                    };
                  });
                }}
                onKeyUp={(e: any) => {
                  scanResolve(e);
                }}
                error={idError.isError}
                helperText={idError?.isError ? idError.message : ""}
              />
            </div>

            {/* Document title or ISBN */}
            <div className=" sm:w-4/5 w-full">
              <Autocomplete
                value={selectedDoc}
                disablePortal
                freeSolo={true}
                size="small"
                options={borrowingsTitles}
                sx={customTextFieldStyles}
                onChange={(event: any, newValue: any) => {
                  if (newValue) {
                    setSelectedDoc(newValue);
                  }
                }}
                onInputChange={(
                  event: any,
                  newInputValue: string
                ) => {
                  setSelectedDoc(newInputValue);
                }}
                onKeyUp={scanResolve}
                renderInput={(params) => (
                  <TextField
                    variant="outlined"
                    {...params}
                    label="Enter a Title or ISBN"
                  />
                )}
              />
            </div>
            {/* Email */}
            <FormControl>
              <FormLabel sx={{ color: "#2e439d" }}>Email:</FormLabel>
              <RadioGroup
                value={sort}
                onChange={(e: any) => {
                  setSort(e.target.value);
                }}
              >
                <FormControlLabel
                  value="emailAscending"
                  control={
                    <Radio size="medium" sx={{ color: "#2e439d" }} />
                  }
                  label="Ascending"
                />
                <FormControlLabel
                  value="emailDescending"
                  control={
                    <Radio size="medium" sx={{ color: "#2e439d" }} />
                  }
                  label="Descending"
                />
              </RadioGroup>
            </FormControl>
            {/* Title */}
            <FormControl>
              <FormLabel sx={{ color: "#2e439d" }}>Title:</FormLabel>
              <RadioGroup
                value={sort}
                onChange={(e: any) => {
                  setSort(e.target.value);
                }}
              >
                <FormControlLabel
                  value="Ascending"
                  control={
                    <Radio size="medium" sx={{ color: "#2e439d" }} />
                  }
                  label="Ascending"
                />
                <FormControlLabel
                  value="Descending"
                  control={
                    <Radio size="medium" sx={{ color: "#2e439d" }} />
                  }
                  label="Descending"
                />
              </RadioGroup>
            </FormControl>
            {/* <button
              onClick={() => {
                console.log(selectedDoc);
              }}
            >
              log
            </button> */}
          </div>

          {/* Right */}
          <div className=" border-l border-t sm:w-9/12 w-8/12 overflow-y-auto h-[80vh] p-1 xs:p-4 bg-[#f5f9ff]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-1 xs:p-4">
              {filteredBorrowings.map(
                (value: borrowing, index: number) => (
                  <div
                    key={index}
                    className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2"
                  >
                    <p className="text-gray-700 font-medium text-center truncate w-full">
                      {value?.email}
                    </p>
                    <p className="text-gray-600 text-center">
                      {value?.title}
                    </p>
                    <p className="text-gray-500 text-sm text-center">
                      {value?.borrow_date}
                    </p>
                    <button
                      className={styles.submitBtn}
                      onClick={() => {
                        handleResolve(
                          value?.faculty_id,
                          value?.data_id
                        );
                      }}
                    >
                      Resolve
                    </button>
                  </div>
                )
              )}
              {/* Fodder */}
              {/* <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div>
              <div className="w-full bg-white shadow-md rounded-md p-4 flex flex-col items-center space-y-2">
                <p className="text-gray-700 font-medium truncate text-center w-full">
                  test@gmail.com
                </p>
                <p className="text-gray-600">Book</p>
                <p className="text-gray-500 text-sm">Date</p>
                <button
                  className={styles.submitBtn}
                  onClick={() => {}}
                >
                  Resolve
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
  <Navigate to="/login" />;
}
