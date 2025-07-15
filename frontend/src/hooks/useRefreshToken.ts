import axios from "axios";
import useAuth from "./useAuth";

// This component is just a function that call the refresh endpoint and sets the response to the user data.
const useRefreshToken = () => {
  const { setUserData } = useAuth() as { setUserData: any };

  const refresh = async () => {
    const response = await axios.get(
      "http://localhost:8002/refresh",
      {
        withCredentials: true,
      }
    );
    // Note that here we are setting the accessToken as part of the userData.
    setUserData(() => {
      return {
        accessToken: response.data.accessToken,
        email: response.data.email,
        role: response.data.role,
      };
    });
    return response.data.accessToken;
  };
  return refresh;
};

export default useRefreshToken;
