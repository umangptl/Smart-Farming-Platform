import { useState, useEffect } from "react";
import { fetchLivestock } from "../api/livestockApi";

const useLivestock = () => {
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchLivestock();
        setLivestock(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { livestock, setLivestock, loading, error };
};

export default useLivestock;
