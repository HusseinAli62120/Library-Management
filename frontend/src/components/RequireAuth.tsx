import { useContext } from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { userContext } from "../Context/userContext";
import { user } from "../types/user";
export default function RequireAuth({
  allowedUsers,
}: {
  allowedUsers: any[];
}) {
  const { userData } = useContext(userContext) as { userData: user };
  const location = useLocation();
  // We pass the allowed roles in allowedUsers, if the current user has one of these roles, then he/she is in.
  return userData && allowedUsers?.includes(userData?.role) ? (
    <Outlet />
  ) : userData ? (
    <Navigate
      to={"/unauthorized"}
      state={{ from: location }}
      replace
    />
  ) : (
    <Navigate to={"/login"} state={{ from: location }} replace />
  );
}
