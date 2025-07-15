import { useEffect, useState } from "react";
import styles from "../styles/styles.module.css";
import { customTextFieldStyles } from "../styles/customStyles.js";
import Nav from "./Nav";
import {
  TextField,
  Autocomplete,
  Alert,
  Button,
  FormControlLabel,
  Switch,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import useAuth from "../hooks/useAuth.js";
import { error, user } from "../types/user.js";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useTimedAlert } from "../hooks/useTimedAlert.js";

export default function DataEntry() {
  const { userData } = useAuth() as {
    userData: user;
  };
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [cover, setCover] = useState<string>("");
  const [quantity, setQuantity] = useState<any>(1); // We made this "any" to add it to the formData.
  const [date, setDate] = useState<string>("");
  const [ISBN, setISBN] = useState<string>("");
  const [shelf, setShelf] = useState<string>("");
  const [file, setFile] = useState<any>(null);
  const [link, setLink] = useState<string>("");
  const [mode, setMode] = useState("link"); // "upload" or "link"

  const {
    alertMessage,
    countdown,
    showAlert,
    setAlertMessage,
    alertSeverity,
    setAlertSeverity,
  } = useTimedAlert();

  const [isbnError, setIsbnError] = useState<error>({
    isError: false,
    message: "",
  });

  const languages = ["English", "Arabic"];
  const categories = ["Book", "Thesis", "Journal"];
  const shelves = ["A-1", "A-2", "A-3", "A-4", "A-5"];

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault(); // Prevents the page from reloading.
    try {
      const response = await axios.post(
        "http://localhost:8002/postDoc",
        {
          title,
          author,
          category,
          language,
          cover,
          quantity,
          date,
          ISBN,
          shelf,
          link,
        },
        { withCredentials: true }
      );
      console.log(response);

      if (
        response.data.message ===
        "Document has been added sucessfully"
      ) {
        const insertedId = response.data.info.insertId;
        console.log(insertedId);

        const formData = new FormData();
        formData.append("pdf", file); // To ensure only pdf files
        formData.append("insertedId", insertedId);

        const res = await axios.post(
          "http://localhost:8002/postContent",
          formData,
          { withCredentials: true }
        );
        console.log(res);
      }

      // Show feedback
      showAlert(response.data.message, "success");
      console.log(response.data.info);

      // Reset values
      setTitle("");
      setAuthor("");
      setCategory("");
      setLanguage("");
      setCover("");
      setQuantity(1);
      setDate("");
      setISBN("");
      setShelf("");
      setFile(null);
      setLink("");
      setIsbnError(() => {
        return {
          isError: false,
          message: "",
        };
      });
    } catch (error: any) {
      if (error.response && error.response.status === 500) {
        // Set error message
        showAlert("Internal server error, please try again", "error");
      }
    }
  };

  const fetchDataFromApi = async () => {
    const spacelessISBN = ISBN.replace(/\s+/g, "");

    if (spacelessISBN.length === 10 || spacelessISBN?.length === 13) {
      console.log("API");

      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${spacelessISBN}`
      );
      console.log(response.data);

      if (response?.data?.totalItems !== 0) {
        console.log();

        const data = response.data.items[0].volumeInfo;
        console.log(data);

        setTitle(data?.title);
        if (data?.authors) {
          setAuthor(data.authors[0]);
        }
        if (data?.language === "en") {
          setLanguage(languages[0]);
        }
        if (data?.imageLinks) {
          setCover(data.imageLinks.thumbnail);
        }
        if (data?.publishedDate) {
          setDate(data?.publishedDate);
          console.log(data?.publishedDate);
        }
        setCategory(categories[0]);
        setISBN(spacelessISBN);

        // Reset error
        setIsbnError(() => {
          return {
            isError: false,
            message: "",
          };
        });

        // Error handeling.
      } else {
        setIsbnError(() => {
          return {
            isError: true,
            message: "Book not found.",
          };
        });
      }
    }
  };

  // useEffect to call API after with each ISBN change.
  useEffect(() => {
    // To ignore spaces, in case we paste the ISBN
    const spacelessISBN = ISBN.replace(/\s+/g, "");
    if (spacelessISBN.length === 10 || spacelessISBN.length === 13) {
      fetchDataFromApi();
    }
  }, [ISBN]);

  // Switch between upload or online URL
  const handleSwitch = () => {
    setMode(mode === "upload" ? "link" : "upload");
    setFile(null); // Reset file if switching to link
    setLink(""); // Reset link if switching to upload
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  if (userData?.accessToken) {
    return (
      <div className={styles.page}>
        <Nav />

        {alertMessage && alertSeverity && (
          <Alert
            severity={alertSeverity}
            onClose={() => setAlertMessage(null)}
          >
            {alertMessage}{" "}
            {countdown !== null ? `(${countdown}s)` : ""}{" "}
          </Alert>
        )}

        <div className="flex-1 flex flex-col justify-center items-center w-full shadow-md relative">
          <form
            className={styles.dataForm}
            action="POST"
            onSubmit={handleSubmit}
          >
            {/* Title and Author */}
            <div className=" flex justify-between items-center space-x-16">
              <TextField
                required
                sx={customTextFieldStyles}
                label="Title"
                value={title}
                size="small"
                variant="standard"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
              <TextField
                required
                sx={customTextFieldStyles}
                label="Author"
                value={author}
                size="small"
                variant="standard"
                onChange={(e) => {
                  setAuthor(e.target.value);
                }}
              />
            </div>

            {/* Category and Language */}
            <div className=" flex justify-between items-center space-x-16 w-full">
              <Autocomplete
                value={category}
                style={{ width: "50%" }}
                disablePortal
                size="small"
                options={categories}
                getOptionLabel={(category: any) => category}
                sx={customTextFieldStyles}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setCategory(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    required
                    variant="standard"
                    {...params}
                    label="Category"
                  />
                )}
              />
              <Autocomplete
                value={language}
                style={{ width: "50%" }}
                disablePortal
                size="small"
                options={languages}
                getOptionLabel={(lang: any) => lang}
                sx={customTextFieldStyles}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setLanguage(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    required
                    variant="standard"
                    {...params}
                    label="Language"
                  />
                )}
              />
            </div>

            {/* Shelf and Quantity */}
            <div className=" flex justify-between items-center space-x-16 w-full">
              <Autocomplete
                value={shelf}
                style={{ width: "50%" }}
                disablePortal
                size="small"
                options={shelves}
                getOptionLabel={(shelf: any) => shelf}
                sx={customTextFieldStyles}
                onChange={(event, newValue) => {
                  if (newValue) {
                    setShelf(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    required
                    variant="standard"
                    {...params}
                    label="Shelf"
                  />
                )}
              />
              <TextField
                required
                sx={customTextFieldStyles}
                label="Quantity"
                style={{ width: "50%" }}
                value={quantity}
                size="small"
                variant="standard"
                type="number"
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty value temporarily
                  if (value === "") {
                    setQuantity("");
                    return;
                  }
                  // Prevent negative numbers
                  if (Number(value) >= 0) {
                    setQuantity(Number(value));
                  }
                }}
                // Enforce minimum value of 1 when input loses focus
                onBlur={() => {
                  if (quantity === "" || quantity < 1) {
                    setQuantity(1);
                  }
                }}
              />
            </div>

            {/* Cover and ISBN */}
            <div className=" flex justify-between items-center space-x-16 w-full">
              <TextField
                sx={customTextFieldStyles}
                style={{ width: "50%" }}
                label="Cover"
                value={cover}
                size="small"
                variant="standard"
                onChange={(e) => {
                  setCover(e.target.value);
                }}
              />
              <TextField
                sx={customTextFieldStyles}
                style={{ width: "50%" }}
                label="ISBN"
                value={ISBN}
                size="small"
                error={isbnError?.isError}
                helperText={
                  isbnError?.isError ? isbnError?.message : ""
                }
                onBlur={() => {
                  setIsbnError(() => {
                    return {
                      isError: false,
                      message: "",
                    };
                  });
                }}
                variant="standard"
                onChange={(e) => {
                  setISBN(e.target.value);
                  setIsbnError(() => {
                    return {
                      isError: false,
                      message: "",
                    };
                  });
                }}
              />
            </div>

            {/* Date and File */}
            <div className=" flex justify-between items-center space-x-16 w-full">
              <TextField
                sx={customTextFieldStyles}
                style={{ width: "50%" }}
                value={date}
                type={date.length === 4 ? "text" : "date"} // Use "text" for YYYY, "date" for full date
                size="small"
                variant="standard"
                helperText="Release Date"
                onChange={(e) => {
                  setDate(e.target.value);
                }}
              />

              {/* To enter content or online link */}
              <div className=" flex flex-col w-1/2">
                {/* Upload Button */}
                {mode === "upload" ? (
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload files
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(e: any) => {
                        setFile(e.target.files[0]);
                      }}
                    />
                  </Button>
                ) : (
                  <TextField
                    label="Enter URL"
                    variant="standard"
                    size="small"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                )}
                {file?.name}
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === "upload"}
                      onChange={handleSwitch}
                      color="primary"
                    />
                  }
                  label={
                    mode === "link"
                      ? "Switch to Upload"
                      : "Switch to Link"
                  }
                />
              </div>
            </div>
            {/* Submit */}
            <div className=" w-full flex justify-center items-end">
              <button className={styles.submitBtn} type="submit">
                Submit
              </button>
            </div>
          </form>
          {/* Notification */}
          <div className="w-full absolute bottom-0">
            <Alert severity="info">
              Scan the ISBN to automatically enter the data. If
              available, upload the document, or enter an online link.
            </Alert>
          </div>
        </div>
      </div>
    );
  }
  return <Navigate to={"/login"} />;
}

// Edit this page to make it fit the screen
