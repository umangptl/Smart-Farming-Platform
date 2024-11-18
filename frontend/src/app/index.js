// pages/index.js (or any component)
import { useEffect, useState } from "react";

const Home = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Make an API call to the Flask backend
    fetch("http://127.0.0.1:5000/")
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>{message || "Loading..."}</h1>
    </div>
  );
};

export default Home;
