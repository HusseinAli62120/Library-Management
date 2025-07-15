import useAuth from "../hooks/useAuth";
import { borrowing, document, user } from "../types/user";
import styles from "../styles/styles.module.css";
import Nav from "./Nav";
import { useState } from "react";
import { Alert, Fade, Tab, Tabs } from "@mui/material";
import { Navigate } from "react-router-dom";
import BorrowingsAssign from "./BorrowingsAssign";
import BorrowingsResolve from "./BorrowingsResolve";

export default function Borrowings() {
  const [page, setPage] = useState<number>(0);
  const [borrowings, setBorrowings] = useState<borrowing[]>([]);
  const [data, setData] = useState<document[]>([]);
  const [borrowingsTitles, setBorrowingsTitles] = useState<string[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredBorrowings, setFilteredBorrowings] = useState<
    borrowing[]
  >([]);

  const { userData } = useAuth() as {
    userData: user;
  };

  if (userData?.accessToken) {
    return (
      <div className={`${styles.page} relative overflow-hidden`}>
        <Nav
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          borrowings={borrowings}
          setFilteredBorrowings={setFilteredBorrowings}
          page={page}
        />

        <div className="overflow-hidden">
          <div className=" flex justify-center">
            <Tabs
              variant="scrollable"
              scrollButtons
              textColor="primary"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#f7c236",
                },
                "& .MuiTab-root": {
                  color: "#2e439d",
                },
                "& .MuiTab-root:hover": {
                  backgroundColor: "#f1f4ff",
                },
              }}
              value={page}
              onChange={(e, newValue) => {
                setPage(newValue);
              }}
            >
              {/* These are the clickable tabs */}
              <Tab label="Resolve" />
              <Tab label="Assign" />
            </Tabs>
          </div>
          {/* Tab pages */}

          {/* Resolve */}
          <Fade in={page === 0} timeout={300}>
            <div hidden={page !== 0}>
              <BorrowingsResolve
                borrowings={borrowings}
                setBorrowings={setBorrowings}
                setData={setData}
                borrowingsTitles={borrowingsTitles}
                setBorrowingsTitles={setBorrowingsTitles}
                filteredBorrowings={filteredBorrowings}
                setFilteredBorrowings={setFilteredBorrowings}
              />
            </div>
          </Fade>

          {/* Assign */}
          <Fade in={page === 1} timeout={300}>
            <div hidden={page !== 1}>
              <BorrowingsAssign
                setBorrowings={setBorrowings}
                setFilteredBorrowings={setFilteredBorrowings}
                data={data}
                setData={setData}
                setBorrowingsTitles={setBorrowingsTitles}
              />
            </div>
          </Fade>
        </div>
        {/* Info */}
        <div className=" absolute bottom-0 w-full">
          {page === 0 && (
            <Alert severity="info">
              <p>Scan the card to resolve the borrowing.</p>
            </Alert>
          )}
        </div>
      </div>
    );
  }
  return <Navigate to="/login" />;
}
