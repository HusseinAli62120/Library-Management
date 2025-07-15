import axios from "axios";
import { userBorrowing, userInfo } from "../types/user";
import { useTimedAlert } from "../hooks/useTimedAlert.js";
import { Alert } from "@mui/material";

export default function ExtendModal(props: {
  modalOpen: boolean;
  setModalOpen: any;
  userInfo: userInfo | null;
  userBorrowings: userBorrowing[] | null;
  setUserBorrowings: any;
}) {
  const {
    alertMessage,
    countdown,
    showAlert,
    setAlertMessage,
    alertSeverity,
    setAlertSeverity,
  } = useTimedAlert();

  const extend = async (
    renew: number,
    date: string,
    document_id: number,
    userId: number | undefined
  ) => {
    if (
      (userInfo?.role === "Under-Graduate" && renew < 2) ||
      (userInfo?.role === "Professor" && renew < 4)
    ) {
      try {
        const res = await axios.put(
          "http://localhost:8002/borrowings/extend",
          { date, document_id, renew, userId },
          { withCredentials: true }
        );
        console.log(res.data);
        setUserBorrowings(res.data.userBorrowings);
        showAlert(res.data.message, "success");
      } catch (error: any) {
        console.log(error);
        if (error.response.status === 500) {
          setAlertSeverity("error");
          showAlert(error.response.data.message, "error");
        } else {
          showAlert(error.response.data.message, "warning");
        }
      }
    } else {
      showAlert(
        "You have already reached the extension limit.",
        "warning"
      );
    }
  };

  const { userInfo, userBorrowings, setUserBorrowings } = props;

  return (
    <div>
      {alertMessage && alertSeverity && (
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage} {countdown !== null ? `(${countdown}s)` : ""}{" "}
        </Alert>
      )}
      <div className="flex justify-center items-center -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 w-full">
        <div className="flex justify-center items-center p-1 xs:p-4 w-full">
          <div className="bg-white shadow-lg rounded-lg p-1 xs:p-6 w-full max-w-3xl">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">
              Active Borrowings
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-uniBlue text-white">
                    <th className="py-3 px-4 text-left">Title</th>
                    <th className="py-3 px-4 text-left">Deadline</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userBorrowings?.length &&
                    userBorrowings?.map(
                      (value: userBorrowing, index: number) => (
                        <tr
                          key={index}
                          className="border-b border-gray-300 hover:bg-gray-100 transition"
                        >
                          <td className="py-3 px-4">{value.title}</td>
                          <td className="py-3 px-4">
                            {value.borrow_date}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              className="bg-uniBlue hover:scale-105 hover:text-uniGold text-white font-medium py-2 px-4 rounded transition"
                              onClick={() => {
                                extend(
                                  value?.renew,
                                  value?.borrow_date,
                                  value?.document_id,
                                  userInfo?.id
                                );
                              }}
                            >
                              Extend
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
