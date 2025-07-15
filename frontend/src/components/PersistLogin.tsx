import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import { user } from "../types/user";

// This component just calls the refresh function in the useRefreshToken component to get a new token, on every refresh.

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { userData } = useAuth() as {
    userData: user;
  };

  useEffect((): any => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        isMounted && setIsLoading(false);
      }
    };
    if (!userData?.accessToken && isLoading) {
      // Only attempt to refresh if there is no accessToken and if the component is still loading
      verifyRefreshToken();
      console.log("Persist!!!!!!!"); // This just shows that this useEffect is only running when we refresh.
    } else {
      setIsLoading(false); // No need to refresh if accessToken is already present
    }

    return () => (isMounted = false);
  }, []);

  // useEffect(() => {
  //   console.log(`isLoading: ${isLoading}`);
  //   console.log(`aT: ${JSON.stringify(userData?.accessToken)}`);
  // }, [isLoading]);

  return isLoading ? <h1>loading...</h1> : <Outlet />; // Ideally we want a skeleton here
};
export default PersistLogin;
