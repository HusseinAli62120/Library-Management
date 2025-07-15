import { useContext } from "react";
import { userContext } from "../Context/userContext";
const useAuth = () => {
  return useContext(userContext); // This just returns an instance of the userContext so we don't have to write this everytime
};
export default useAuth;
