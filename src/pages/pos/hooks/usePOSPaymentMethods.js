
import { useCallback, useEffect, useState } from "react";
import paymentMethodApi from "../../../services/paymentMethod";

const usePOSPaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let response;

      try {
        response = await paymentMethodApi.getActive();
      } catch {
        response = await paymentMethodApi.getAll({
          is_active: true,
        });
      }

      const methods = Array.isArray(response)
        ? response
        : response?.results ??
          response?.data?.results ??
          response?.data ??
          [];

      setPaymentMethods(methods);

      if (methods.length === 0) {
        setError(
          "No active payment methods found. Contact the administrator."
        );
      }
    } catch (err) {
      console.error("Failed to load payment methods:", err);

      setPaymentMethods([]);

      const status = err?.response?.status;

      if (status === 403) {
        setError(
          "You do not have permission to view payment methods."
        );
      } else if (status === 404) {
        setError("Payment methods endpoint was not found.");
      } else {
        setError(
          "Failed to load payment methods. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    loadPaymentMethods,
  };
};

export default usePOSPaymentMethods;
