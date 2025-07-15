import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import Root from "./components/Root";
import RequireAuth from "./components/RequireAuth";
import Unauthorized from "./components/Unauthorized";
import Borrowings from "./components/Borrwoings";
import PersistLogin from "./components/PersistLogin";
import NotFound from "./components/NotFound";
import DataEntry from "./components/DataEntry";
import Documents from "./components/Documents";
import SignUp from "./components/SignUp";

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Root />}>
        {/* Pages that require login */}
        <Route element={<PersistLogin />}>
          {/* Admin only page */}
          <Route element={<RequireAuth allowedUsers={["admin"]} />}>
            <Route path="/Borrowings" element={<Borrowings />} />
            <Route path="/DataEntry" element={<DataEntry />} />
            <Route path="/Documents" element={<Documents />} />
          </Route>
          {/* User & admin pages */}
          <Route path="/" element={<Home />} />
        </Route>
        {/* Pages that don't require login */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}
