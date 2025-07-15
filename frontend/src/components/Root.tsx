import { useState } from "react";
import { Outlet } from "react-router-dom";
import { accessTokenContext } from "../Context/accessToken";
import { userContext } from "../Context/userContext";
import { userBorrowingsContext } from "../Context/userBorrowingsContext";
import { userBorrowing } from "../types/user";

const Root = () => {
  // Global states
  const [userData, setUserData] = useState<any>(null); // We need to add a type to this, but for now, since all we are getting from the backend is the username, this is fine. But we want to get the username and role, at the minimum, maybe even the profile pic.
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userBorrowings, setUserBorrowings] = useState<
    userBorrowing[] | null
  >(null);

  return (
    <div>
      {/* The stuff before the outlet are universal for all pages, like a navBar. It's pretty much a layout */}
      <userBorrowingsContext.Provider
        value={{ userBorrowings, setUserBorrowings }}
      >
        <userContext.Provider value={{ userData, setUserData }}>
          <accessTokenContext.Provider
            value={{ accessToken, setAccessToken }}
          >
            <Outlet />
          </accessTokenContext.Provider>
        </userContext.Provider>
      </userBorrowingsContext.Provider>
    </div>
  );
};

export default Root;
