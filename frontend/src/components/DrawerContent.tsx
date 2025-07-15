import {
  TextField,
  Autocomplete,
  Button,
  FormControlLabel,
  Switch,
  Checkbox,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { customTextFieldStyles } from "../styles/customStyles";
import styles from "../styles/styles.module.css";
import { document } from "../types/user";
import axios from "axios";
export default function DrawerContent(props: {
  item: document;
  setDrawerOpen: any;
  setDocuments: any;
  setFilteredDocuments: any;
  showAlert: any;
}) {
  const {
    item,
    setDrawerOpen,
    setDocuments,
    setFilteredDocuments,
    showAlert,
  } = props;

  // Variables
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [cover, setCover] = useState<string>("");
  const [quantity, setQuantity] = useState<any>(undefined); // We made this "any" to add it to the formData.
  const [date, setDate] = useState<any>(undefined);
  const [ISBN, setISBN] = useState<any>(undefined);
  const [shelf, setShelf] = useState<string>("");
  const [file, setFile] = useState<any>(null);
  const [link, setLink] = useState<string>("");
  const [clear, setClear] = useState<any>(false); // Not boolean for ts.
  const [mode, setMode] = useState("link"); // "upload" or "link"

  const languages = ["English", "Arabic"];
  const categories = ["Book", "Thesis", "Journal"];
  const shelves = ["A-1", "A-2", "A-3", "A-4", "A-5"];

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

  // Storage path
  const storagePath = `/uploads/${file?.name}`;

  const handleSwitch = () => {
    setMode(mode === "upload" ? "link" : "upload");
    setFile(null); // Reset file if switching to link
    setLink(""); // Reset link if switching to upload
  };

  const handleUpdate = async (e: { preventDefault: () => void }) => {
    // This is used to ensure that the prvious values and value restrictions are maintained
    const updatedTitle = title || item?.title || "";
    const updatedAuthor = author || item?.author || "";
    const updatedCategory = category || item?.category || "";
    const updatedLanguage = language || item?.language || "";
    const updatedCover = cover || item?.cover || "";
    const updatedQuantity =
      quantity !== undefined && quantity !== null
        ? quantity
        : item?.quantity || "";
    const updatedDate =
      date !== undefined && date !== null
        ? date
        : item?.release_date || "";
    const updatedISBN =
      ISBN !== undefined && ISBN !== null ? ISBN : item?.ISBN || "";

    const updatedShelf = shelf || item?.shelf || "";

    try {
      e.preventDefault();
      const id: any = item?.id;
      const formData = new FormData();

      formData.append("pdf", file); // To ensure only pdf files
      formData.append("id", id); // To ensure only pdf files
      formData.append("title", updatedTitle); // To ensure only pdf files
      formData.append("author", updatedAuthor); // To ensure only pdf files
      formData.append("category", updatedCategory); // To ensure only pdf files
      formData.append("language", updatedLanguage); // To ensure only pdf files
      formData.append("cover", updatedCover); // To ensure only pdf files
      formData.append("quantity", updatedQuantity); // To ensure only pdf files
      formData.append("date", updatedDate); // To ensure only pdf files
      formData.append("ISBN", updatedISBN); // To ensure only pdf files
      formData.append("shelf", updatedShelf); // To ensure only pdf files
      formData.append("link", link);
      formData.append("clear", clear);
      const response = await axios.put(
        "http://localhost:8002/updateDoc",
        formData,
        { withCredentials: true }
      );

      // Update the files without useEffect.
      setDocuments(response.data.updatedDocs);
      setFilteredDocuments(response.data.updatedDocs);
      setLink("");
      setClear(false);

      // Show feedback
      showAlert(response.data.message, "success");

      // Close Drawer
      setDrawerOpen(false);
    } catch (error: any) {
      showAlert(error.response.data.message, "error");
    }
  };
  return (
    <form
      method="PUT"
      onSubmit={handleUpdate}
      className=" flex flex-col space-y-3 items-center justify-between h-screen"
    >
      <p className=" text-2xl text-uniBlue">Edit Document</p>
      {/* Title */}
      <TextField
        required
        sx={customTextFieldStyles}
        style={{ width: "100%" }}
        value={title || item?.title}
        size="small"
        label="Title"
        variant="outlined"
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        onBlur={() => {
          if (!title) {
            setTitle(item?.title);
          }
        }}
      />
      {/* Author */}
      <TextField
        required
        sx={customTextFieldStyles}
        style={{ width: "100%" }}
        label="Author"
        value={author || item?.author}
        size="small"
        variant="outlined"
        onChange={(e) => setAuthor(e.target.value)}
        onBlur={() => {
          if (!author) setAuthor(item?.author);
        }}
      />
      {/* Category */}
      <Autocomplete
        value={category || item?.category}
        style={{ width: "100%" }}
        disablePortal
        size="small"
        options={categories}
        getOptionLabel={(category: any) => category}
        sx={customTextFieldStyles}
        onChange={(event, newValue) => {
          setCategory(newValue || item?.category);
        }}
        renderInput={(params) => (
          <TextField
            required
            variant="outlined"
            {...params}
            label="Category"
          />
        )}
      />
      {/* Language */}
      <Autocomplete
        value={language || item?.language}
        style={{ width: "100%" }}
        disablePortal
        size="small"
        options={languages}
        getOptionLabel={(lang: any) => lang}
        sx={customTextFieldStyles}
        onChange={(event, newValue) => {
          setLanguage(newValue || item?.language);
        }}
        renderInput={(params) => (
          <TextField
            required
            variant="outlined"
            {...params}
            label="Language"
          />
        )}
      />
      {/* Shelf */}
      <Autocomplete
        value={shelf || item?.shelf}
        style={{ width: "100%" }}
        disablePortal
        size="small"
        options={shelves}
        getOptionLabel={(shelf: any) => shelf}
        sx={customTextFieldStyles}
        onChange={(event, newValue) => {
          setShelf(newValue || item?.shelf);
        }}
        renderInput={(params) => (
          <TextField
            required
            variant="outlined"
            {...params}
            label="Shelf"
          />
        )}
      />
      {/* Quantity */}
      <TextField
        required
        sx={customTextFieldStyles}
        label="Quantity"
        style={{ width: "100%" }}
        value={
          quantity !== undefined ? quantity : item?.quantity || ""
        }
        size="small"
        variant="outlined"
        type="number"
        onChange={(e) => {
          const value = e.target.value;
          setQuantity(value !== "" ? Number(value) : "");
        }}
        onBlur={() => {
          if (!quantity || quantity <= 0) {
            setQuantity(0);
          }
        }}
      />
      {/* Cover */}
      <TextField
        sx={customTextFieldStyles}
        style={{ width: "100%" }}
        label="Cover"
        value={cover !== undefined ? cover : item?.cover || ""}
        size="small"
        variant="outlined"
        onChange={(e) => {
          setCover(e.target.value);
        }}
      />
      {/* ISBN */}
      <TextField
        sx={customTextFieldStyles}
        style={{ width: "100%" }}
        label="ISBN"
        value={ISBN !== undefined ? ISBN : item?.ISBN || ""}
        size="small"
        variant="outlined"
        onChange={(e) => {
          setISBN(e.target.value);
        }}
      />
      {/* Date */}
      <TextField
        sx={customTextFieldStyles}
        style={{ width: "100%" }}
        value={date !== undefined ? date : item?.date || ""}
        type="date"
        size="small"
        variant="outlined"
        helperText="Release Date"
        onChange={(e) => {
          setDate(e.target.value);
        }}
      />
      {/* File link */}
      {/* Truncate the current content */}
      <div className=" flex flex-col w-full">
        {/* Upload Button */}
        {mode === "upload" ? (
          <div className=" flex items-center flex-col space-y-3">
            {item?.document_url ? (
              <p>
                <span className=" text-uniBlue font-semibold truncate">
                  Current content:
                </span>
                <span className="">
                  {file ? storagePath : item?.document_url}
                </span>
              </p>
            ) : file ? (
              file?.name
            ) : (
              "N/A"
            )}
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              disabled={clear}
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
          </div>
        ) : (
          <TextField
            sx={customTextFieldStyles}
            label="Enter URL"
            disabled={clear}
            variant="outlined"
            size="small"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
            }}
          />
        )}
        {/* Switch and clear */}
        <div>
          <FormControlLabel
            control={
              <Switch
                disabled={clear}
                checked={mode === "upload"}
                onChange={handleSwitch}
                color="primary"
              />
            }
            label={
              mode === "link" ? "Switch to Upload" : "Switch to Link"
            }
          />
          <FormControlLabel
            labelPlacement="end"
            control={
              <Checkbox
                value={clear}
                defaultChecked={false}
                onChange={() => {
                  setClear(!clear);
                  if (!clear) {
                    setFile(null);
                    setLink("");
                  }
                }}
              />
            }
            label="Clear Content"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 items-center justify-evenly w-full">
        <button type="submit" className={styles.submitBtn}>
          Save Changes
        </button>
        <button
          className={styles.cancelBtn}
          onClick={(e: { preventDefault: () => void }) => {
            e.preventDefault();
            setDrawerOpen(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
