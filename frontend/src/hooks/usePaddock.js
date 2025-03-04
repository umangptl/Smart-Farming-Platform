import { useState, useEffect } from "react";
import { fetchPaddock } from "../api/paddockApi";

const usePaddock = () => {
  const [paddocks, setPaddocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPaddock();
        setPaddocks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { paddocks, setPaddocks, loading, error };
};

export default usePaddock;
