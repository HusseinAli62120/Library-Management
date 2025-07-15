import { Link, useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import logo from "../images/University_of_Baghdad_official_seal.png";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import useAuth from "../hooks/useAuth";
import styles from "../styles/styles.module.css";
import { customTextFieldStyles } from "../styles/customStyles.js";
import {
  borrowing,
  document,
  user,
  userBorrowing,
  userInfo,
} from "../types/user";
import { Avatar, Button, Drawer } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import ExtendModal from "./ExtendModal.js";
import useUserBorrowings from "../hooks/useUserBorrowings.js";

export default function Nav(params: {
  // The params are optional, so that in pages where they are not passed, they don't cause an error.
  searchQuery?: string;
  setSearchQuery?: any;
  documents?: document[];
  setFilteredDocuments?: any;
  borrowings?: borrowing[];
  setFilteredBorrowings?: any;
  page?: any;
}) {
  // Global variable
  const { userData, setUserData } = useAuth() as {
    userData: user;
    setUserData: any;
  };

  const { userBorrowings, setUserBorrowings } =
    useUserBorrowings() as {
      userBorrowings: userBorrowing[] | null;
      setUserBorrowings: any;
    };

  const [isCardVisible, setIsCardVisible] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<userInfo | null>(null);

  const location = useLocation(); // To get the current path

  const {
    searchQuery,
    setSearchQuery,
    documents,
    setFilteredDocuments,
    borrowings,
    setFilteredBorrowings,
    page,
  } = params;

  // Event handlers for showing and hiding the card
  const showCard = () => setIsCardVisible(true);
  const hideCard = () => setIsCardVisible(false);

  // Fetch the user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8002/borrowings/userInfo?email=${userData?.email}`,
          { withCredentials: true }
        );

        // Handle response
        setUserInfo(res.data.userInfo);
        console.log(userBorrowings);

        setUserBorrowings(res.data.userBorrowings);
      } catch (error: any) {
        if (error.response) {
          console.log(error.response.data.message);
        }
      }
    };
    fetchUserInfo();
  }, []);

  // Search
  const handleChange = (e: any) => {
    const lowerCase = e.target.value.toLowerCase();

    // Documents search
    if (
      location.pathname === "/" ||
      location.pathname === "/Documents"
    ) {
      if (documents && setFilteredDocuments) {
        // Update searchQuery directly before filtering
        setSearchQuery(lowerCase);

        const filteredData = documents.filter((value: document) => {
          // Use the input value directly for filtering, not the searchQuery state
          return value.title.toLowerCase().includes(lowerCase);
        });

        setFilteredDocuments(filteredData); // Update the filtered documents
      }
    }

    // Borrowings search
    if (location.pathname === "/Borrowings") {
      if (borrowings && setFilteredBorrowings) {
        // Update searchQuery directly before filtering
        setSearchQuery(lowerCase);

        const filteredData = borrowings.filter((value: borrowing) => {
          // Use the input value directly for filtering, not the searchQuery state
          return value.title.toLowerCase().includes(lowerCase);
        });

        setFilteredBorrowings(filteredData); // Update the filtered borrowings
      }
    }
  };
  // Logout
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8002/logout", {
        withCredentials: true, // We add this with every GET to access httpOnly cookies
      });
      setUserData(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header>
      <nav
        className=" w-full flex h-[10vh] justify-between items-center md:px-4 px-1 py-2 border border-1"
        onMouseLeave={hideCard} // Hide the card if we are not hovering on the nav.
      >
        {/* The left section */}
        <div>
          {userData.role === "admin" && (
            <div>
              <button
                className=" md:hidden block"
                onClick={() => {
                  setDrawerOpen(true);
                }}
              >
                <MenuIcon
                  sx={{ color: "rgb(46 67 157)" }}
                  fontSize="large"
                />
              </button>
              {/* Drawer */}
              <div>
                <Drawer
                  open={drawerOpen}
                  onClose={() => {
                    setDrawerOpen(false);
                  }}
                  PaperProps={{
                    sx: {
                      width: {
                        xs: "75%",
                        sm: "30%",
                      },
                      padding: "20px",
                    },
                  }}
                >
                  <div className="flex flex-col space-y-8 items-center justify-center">
                    <div className=" flex space-x-8 items-center">
                      <Link to="/">
                        <img
                          src={logo}
                          alt="image"
                          className="w-12 rounded-full"
                        />
                        <pre className=" text-uniBlue text-xl">
                          COENG
                        </pre>
                      </Link>
                    </div>
                    <Link className={styles.link} to="/Documents">
                      Documents
                    </Link>
                    <Link className={styles.link} to="/DataEntry">
                      Data entry
                    </Link>
                    <Link className={styles.link} to="/Borrowings">
                      Borrowings
                    </Link>
                  </div>
                </Drawer>
              </div>
            </div>
          )}
          <div
            className={`${
              userData?.role === "admin" && "hidden md:flex"
            } flex md:space-x-2 space-x-1 items-center`}
          >
            <Link to="/">
              <img
                src={logo}
                alt="image"
                className="w-12 rounded-full"
              />
            </Link>
            <pre className=" text-uniBlue">COENG</pre>
          </div>
        </div>

        {/* Right section */}
        <div className=" flex md:space-x-1 space-x-1 items-center relative md:justify-normal justify-end">
          {userData.role === "admin" && (
            <div className="hidden md:flex md:space-x-5 space-x-1 items-center">
              <Link className={styles.link} to="/Documents">
                Documents
              </Link>
              <Link
                className={`${styles.link} whitespace-nowrap`}
                to="/DataEntry"
              >
                Data entry
              </Link>
              <Link className={styles.link} to="/Borrowings">
                Borrowings
              </Link>
            </div>
          )}
          {/* log */}
          {/* <button
            onClick={() => {
              console.log(userBorrowings);
              console.log(userInfo);
              if (userBorrowings) {
                console.log("has borrow");
              }
              console.log(userData);
            }}
          >
            log
          </button> */}
          {/* Search bar */}
          {(location?.pathname === "/" ||
            location?.pathname === "/Documents" ||
            (location.pathname === "/Borrowings" && page === 0)) && (
            <TextField
              sx={{
                ...customTextFieldStyles,
                width: {
                  xs: "50%", // Full width on extra small screens (xs)
                  sm: "100%", // 80% width on small screens (sm)
                },
              }}
              label="Search"
              size="small"
              variant="outlined"
              value={searchQuery}
              onChange={handleChange}
              type="text"
            />
          )}
          {/* Profile pic and card */}
          <div
            className=" inline relative cursor-pointer"
            onMouseEnter={showCard}
          >
            <Avatar sx={{ bgcolor: "white", color: "black" }}>
              <PersonOutlineIcon
                fontSize="large"
                sx={{ color: "#2e439d" }}
              />
            </Avatar>
          </div>
          {/* card */}
          {isCardVisible && (
            <div
              className={styles.card}
              onMouseEnter={showCard}
              onMouseLeave={hideCard}
            >
              {/* Top */}
              <p className=" font-semibold">
                Email:
                <span className=" text-uniBlue">
                  {userInfo
                    ? " " + userInfo?.email
                    : " " + userData?.email}
                </span>
              </p>
              {/* Middle */}
              <div className="w-full pr-2 flex justify-between">
                <p className=" font-semibold">
                  Role:
                  <span className=" text-uniBlue">
                    {userInfo
                      ? " " + userInfo?.role
                      : " " + userData?.role}
                  </span>
                </p>
                {userInfo && userBorrowings?.length ? (
                  <button
                    onClick={() => {
                      setModalOpen(true);
                    }}
                    className={styles.link}
                  >
                    View Borrowings
                  </button>
                ) : (
                  ""
                )}
              </div>
              {/* Bottom */}
              <div className=" w-full flex justify-center">
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  color="error"
                  endIcon={<LogoutIcon className="text-white" />}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Fade in={modalOpen}>
            <div>
              <ExtendModal
                //👇 props
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                userInfo={userInfo}
                userBorrowings={userBorrowings}
                setUserBorrowings={setUserBorrowings}
                // setAlertMessage={setAlertMessage}
                // setAlertSeverity={setAlertSeverity}
              />
            </div>
          </Fade>
        </Modal>
      </nav>
    </header>
  );
}
