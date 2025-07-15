import { useState } from "react";

export const useTimedAlert = (initialTime = 5) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(
    null
  );
  const [alertSeverity, setAlertSeverity] = useState<
    "success" | "error" | "warning" | null
  >(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Set the values of the message.
  const showAlert = (
    message: string,
    severity: "success" | "error" | "warning" | null
  ) => {
    setAlertMessage(message);
    setCountdown(initialTime);
    setAlertSeverity(severity);

    // This is to update the countdown every one second.
    const interval = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    // This function triggers after the time runs out, in our case it's 5s.
    const timer = setTimeout(() => {
      setAlertMessage(null);
      setCountdown(null);
      setAlertSeverity(null);
      clearInterval(interval);
    }, initialTime * 1000);

    // Clear the two initially.
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  };

  // The values we can access upon calling this hook.
  return {
    alertMessage,
    countdown,
    showAlert,
    setAlertMessage,
    alertSeverity,
    setAlertSeverity,
  };
};
