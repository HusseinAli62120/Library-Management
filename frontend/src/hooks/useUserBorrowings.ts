import { useContext } from "react";
import { userBorrowingsContext } from "../Context/userBorrowingsContext";
const useUserBorrowings = () => {
  return useContext(userBorrowingsContext); // This just returns an instance of the userContext so we don't have to write this everytime
};
export default useUserBorrowings;
