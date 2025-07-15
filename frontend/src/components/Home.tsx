// import axios from "axios";
// import { Link, Navigate } from "react-router-dom";
// import { user } from "../types/user";
// import useAuth from "../hooks/useAuth";
// import styles from "../styles/styles.module.css";
// import Nav from "./Nav";

// const Home = () => {
//   const { userData, setUserData } = useAuth() as {
//     userData: user;
//     setUserData: any;
//   };
//   // as of right now, this function is useless.
//   const handleRefresh = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8002/refresh",
//         { withCredentials: true } // We add this with every GET to access httpOnly cookies
//       );
//       setUserData((prev: user) => {
//         return { ...prev, accessToken: response.data.accessToken };
//       });
//     } catch (error) {
//       console.error("Refresh token failed", error);
//     }
//   };

//   // This will be the user Dashboard
//   if (userData?.accessToken) {
//     return (
//       <div className={styles.page}>
//         <Nav />
//         <div className="flex-1 flex flex-col justify-center items-center space-y-5">
//           <h1 className=" font-bold text-2xl">
//             This is the dashboard page that I need to work on.
//           </h1>
//           <p>
//             Email: <span>{userData?.email}</span>
//           </p>
//           <p>
//             Role: <span>{userData?.role}</span>
//           </p>
//           <div>
//             <button onClick={handleRefresh}>Refresh Token</button>
//           </div>
//           <button
//             onClick={() => {
//               console.log(userData);
//             }}
//           >
//             Log
//           </button>
//           <Link className="" to="/Documents">
//             Documents
//           </Link>
//           <Link className="" to="/Borrowings">
//             Borrowings
//           </Link>
//         </div>
//       </div>
//     );
//   }
//   return <Navigate to="/login" />;
// };

// export default Home;

import styles from "../styles/styles.module.css";
import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { document, user } from "../types/user";
import { Navigate, useLocation } from "react-router-dom";
import JournalCover from "../images/JournalCover.png";
import ThesisCover from "../images/ThesisCover.png";
import axios from "axios";
import Nav from "./Nav";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormGroup from "@mui/material/FormGroup";

export default function Home() {
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

  // Global variable
  const { userData } = useAuth() as {
    userData: user;
  };
  // console.log(userData);

  // Get Documents
  useEffect(() => {
    const getDocuments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8002/getData"
        );
        setDocuments(response.data);
        setFilteredDocuments(response.data); // Initialize filtered documents
        console.log(filteredDocuments);
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    };
    getDocuments();
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

  if (userData?.accessToken) {
    return (
      <div className=" flex flex-col overflow-x-hidden">
        <Nav
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          documents={documents}
          setFilteredDocuments={setFilteredDocuments}
        />
        <div className="flex md:pl-5 pl-1 w-full">
          {/* Left */}
          <div className=" flex flex-col space-y-5 py-8 sm:w-2/12 w-4/12 border-r ">
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
                        onChange={() => {
                          setBook(!book);
                          setSearchQuery("");
                        }}
                        color="primary"
                      />
                    }
                  />
                  <FormControlLabel
                    label="Thesis"
                    control={
                      <Checkbox
                        checked={thesis}
                        onChange={() => {
                          setThesis(!thesis);
                          setSearchQuery("");
                        }}
                        color="primary"
                      />
                    }
                  />
                  <FormControlLabel
                    label="Journal"
                    control={
                      <Checkbox
                        checked={journal}
                        onChange={() => {
                          setJournal(!journal);
                          setSearchQuery("");
                        }}
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
                    setSearchQuery("");
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
                    setSearchQuery("");
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
              {/* <button
                onClick={() => {
                  console.log(filteredDocuments);
                }}
              >
                log
              </button> */}
            </div>
          </div>
          {/* Right */}
          <div className="bg-white sm:w-10/12 w-8/12 h-[90vh] overflow-y-scroll p-1 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredDocuments.map(
                (value: document, index: number) => (
                  <div
                    key={index}
                    className={`w-full bg-white shadow-md rounded-md p-2 flex items-start space-x-2`}
                  >
                    <img
                      className="w-16 xs:w-24 sm:w-16 md:w-24"
                      src={
                        value?.cover_url
                          ? value?.cover_url
                          : value?.category === "Journal"
                          ? JournalCover
                          : ThesisCover
                      }
                    />
                    <div className=" flex flex-col space-y-2 justify-center items-center w-full">
                      <a
                        href={
                          value?.document_url !== null
                            ? value.document_url.startsWith(
                                "/uploads/"
                              )
                              ? `http://localhost:8002${value.document_url}`
                              : value.document_url
                            : "*"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-gray-700 font-medium text-center w-full ${
                          value?.document_url &&
                          "text-sky-700 hover:text-sky-900 underline transition-all ease-linear duration-200"
                        }`}
                      >
                        {value?.title}
                      </a>
                      <p className="text-gray-600 text-center">
                        {value?.author}
                      </p>
                      <p className="text-gray-500 text-sm text-center">
                        {value?.category}
                      </p>
                    </div>
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
  return <Navigate to="/login" />;
}
