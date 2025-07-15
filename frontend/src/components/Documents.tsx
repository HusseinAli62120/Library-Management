import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme } from "@table-library/react-table-library/material-ui";
import { usePagination } from "@table-library/react-table-library/pagination";

import styles from "../styles/styles.module.css";
import Nav from "./Nav";
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TablePagination,
  Alert,
  Checkbox,
  FormGroup,
} from "@mui/material";

import { useEffect, useState } from "react";
import axios from "axios";
import { document, user } from "../types/user";
import TableDocLink from "./TableDocLink";
import useAuth from "../hooks/useAuth";
import { Link, Navigate } from "react-router-dom";
import { useTimedAlert } from "../hooks/useTimedAlert";

export default function Documents() {
  // Variables
  const [documents, setDocuments] = useState<document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<
    document[]
  >([]);
  const [sort, setSort] = useState<string>("");
  const [book, setBook] = useState<boolean>(false);
  const [thesis, setThesis] = useState<boolean>(false);
  const [journal, setJournal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Alert hook
  const {
    alertMessage,
    countdown,
    showAlert,
    setAlertMessage,
    alertSeverity,
    setAlertSeverity,
  } = useTimedAlert();

  // Global variable
  const { userData } = useAuth() as {
    userData: user;
  };

  // Fetch the docs
  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8002/getData"
        );
        setDocuments(response.data);
        setFilteredDocuments(response.data); // Initialize filtered documents
        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    getFiles();
  }, []);

  // Filter based on selected categories
  useEffect(() => {
    const applyFilters = () => {
      // Check if no filters are selected
      if (!book && !thesis && !journal) {
        setFilteredDocuments(documents); // Show all documents
        return;
      }

      // Apply filters
      const filtered = documents.filter((doc) => {
        if (book && doc?.category === "Book") return true;
        if (thesis && doc?.category === "Thesis") return true;
        if (journal && doc?.category === "Journal") return true;
        return false;
      });

      setFilteredDocuments(filtered);
      setSort("");
    };
    applyFilters();
  }, [book, thesis, journal, documents]);

   // Function to handle sorting by title
   const sortByTitle = (order: string) => {
    const sorted = [...filteredDocuments].sort((a, b) => {
      if (order === "Ascending") {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    setFilteredDocuments(sorted);
  };

  // Function to handle sorting by language
  const sortByLanguage = (language: string) => {
    const sorted = [...filteredDocuments].sort(
      (a: document, b: document) => {
        if (language === "Arabic") {
          return a.language.localeCompare(b.language);
        } else {
          return b.language.localeCompare(a.language);
        }
      }
    );
    setFilteredDocuments(sorted);
  };

  // Handle changes to sorting criteria
  useEffect(() => {
    if (sort === "Arabic" || sort === "English") {
      sortByLanguage(sort);
    } else {
      sortByTitle(sort);
    }
  }, [sort]);

  // Theme configuration
  const materialTheme = getTheme({
    horizontalSpacing: 7,
    verticalSpacing: 20,
    striped: true, // Enable striped rows
    highlightOnHover: true,
  });

  // Table columns length
  const customTheme = {
    // The first column is always 50px the next 9 are a min of 100px, the last is always 150px
    Table: ` --data-table-library_grid-template-columns: 50px repeat(9, minmax(100px, 1fr)) 150px;`,
  };

  // Use the themes
  const theme = useTheme([materialTheme, customTheme]);

  // This just adds the headers
  const Headers = [
    {
      label: "Id",
      renderCell: (item: any) => (
        <p className=" text-uniBlue">{item.id}</p>
      ),
    },
    { label: "Title", renderCell: (item: any) => item.title },
    { label: "Author", renderCell: (item: any) => item.author },
    {
      label: "Category",
      renderCell: (item: any) => item.category,
    },
    { label: "Language", renderCell: (item: any) => item.language },
    {
      label: "Cover",
      renderCell: (item: any) => (
        <Link
          className="underline hover:text-sky-500 transition-all ease-linear duration-200 max-w-[150px] overflow-hidden truncate"
          to={item?.cover_url}
          target="_blank"
        >
          {item.cover_url}
        </Link>
      ),
    }, // This also needs a similar treatment to the link in TableDocLink
    { label: "Quantity", renderCell: (item: any) => item.quantity },
    {
      label: "Release Date",
      renderCell: (item: any) => item.release_date,
    },
    { label: "ISBN", renderCell: (item: any) => item.ISBN },
    { label: "Shelf", renderCell: (item: any) => item.shelf },
    {
      label: "Link",
      renderCell: (item: document) => (
        <TableDocLink
          item={item}
          setDocuments={setDocuments}
          setFilteredDocuments={setFilteredDocuments}
          showAlert={showAlert}
          id={item?.id}
          url={item?.document_url}
        />
      ),
    },
  ];

  // This is necessary for pagination and makes sure that none of the fields are empty.
  const transformedFiles = filteredDocuments.map(
    (file: document) => ({
      id: file.id ? file?.id : "N/A",
      title: file.title,
      author: file.author,
      category: file.category,
      language: file.language ? file?.language : "N/A",
      cover_url: file.cover_url ? file?.cover_url : "N/A",
      quantity: file.quantity,
      release_date: file.release_date ?? "N/A",
      ISBN: file.ISBN ? file?.ISBN : "N/A",
      shelf: file.shelf,
      document_url: file.document_url ? file?.document_url : "N/A",
    })
  );

  const data = { nodes: transformedFiles };

  const pagination = usePagination(data, {
    state: {
      page: 0,
      size: 7,
    },
    onChange: (action, state) => {
      console.log(action, state);
    },
  });

  const paginatedData = {
    nodes: transformedFiles.slice(
      pagination.state.page * pagination.state.size,
      (pagination.state.page + 1) * pagination.state.size
    ),
  };

  if (userData?.accessToken) {
    return (
      <div className={`${styles.page} `}>
        <Nav
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          documents={documents}
          setFilteredDocuments={setFilteredDocuments}
        />
        {alertMessage && alertSeverity && (
          <Alert
            severity={alertSeverity}
            onClose={() => {
              setAlertMessage("");
              setAlertSeverity(null);
            }}
          >
            {alertMessage}{" "}
            {countdown !== null ? `(${countdown}s)` : ""}{" "}
          </Alert>
        )}
        <div className="flex flex-1 md:pl-5 pl-1 w-full">
          {/* The left section */}
          <div className=" flex flex-col space-y-5 py-8 sm:w-2/12 w-4/12 border-r border-r-slate-300">
            {/* Sort ascending and descending. */}
            <div className=" flex flex-col space-y-7">
              {/* Categories */}
              <FormControl component="fieldset">
                <FormLabel component="legend">Categories</FormLabel>
                <FormGroup>
                  <FormControlLabel
                    label="Book"
                    control={
                      <Checkbox
                        checked={book}
                        onChange={() => setBook(!book)}
                        color="primary"
                      />
                    }
                  />
                  <FormControlLabel
                    label="Thesis"
                    control={
                      <Checkbox
                        checked={thesis}
                        onChange={() => setThesis(!thesis)}
                        color="primary"
                      />
                    }
                  />
                  <FormControlLabel
                    label="Journal"
                    control={
                      <Checkbox
                        checked={journal}
                        onChange={() => setJournal(!journal)}
                        color="primary"
                      />
                    }
                  />
                </FormGroup>
              </FormControl>
              {/* Title */}
              <FormControl>
                <FormLabel>Sort by Title</FormLabel>
                <RadioGroup
                  value={sort}
                  onChange={(e: any) => {
                    setSort(e.target.value);
                  }}
                >
                  <FormControlLabel
                    value="Ascending"
                    control={<Radio />}
                    label="Ascending"
                  />
                  <FormControlLabel
                    value="Decsending"
                    control={<Radio />}
                    label="Decsending"
                  />
                </RadioGroup>
              </FormControl>

              {/* Language */}
              <FormControl>
                <FormLabel>Sort by Language</FormLabel>
                <RadioGroup
                  value={sort}
                  onChange={(e: any) => {
                    setSort(e.target.value);
                  }}
                >
                  <FormControlLabel
                    value="Arabic"
                    control={<Radio />}
                    label="Arabic"
                  />
                  <FormControlLabel
                    value="English"
                    control={<Radio />}
                    label="English"
                  />
                </RadioGroup>
              </FormControl>
            </div>
          </div>

          {/* The Right section */}
          <div className="bg-slate-50 w-full overflow-y-auto flex flex-col justify-between">
            <div>
              <CompactTable
                columns={Headers}
                data={paginatedData}
                theme={theme}
                layout={{
                  custom: true,
                  horizontalScroll: true,
                  verticalScroll: true,
                }}
              />
            </div>
            <Stack>
              <TablePagination
                component="div"
                count={data.nodes.length}
                page={pagination.state.page}
                rowsPerPage={pagination.state.size}
                rowsPerPageOptions={[7, 14]}
                onRowsPerPageChange={(event) =>
                  pagination.fns.onSetSize(
                    parseInt(event.target.value)
                  )
                }
                onPageChange={(event, newPage) =>
                  pagination.fns.onSetPage(newPage)
                }
              />
            </Stack>
          </div>
        </div>
      </div>
    );
  }
  return <Navigate to="/login" />;
}
