export const API_BASE_URL = process.env.NODE_ENV === "testing"
  ? "https://api.example.com"
  // : (false ? "http://127.0.0.1:5000" : "http://10.0.0.252:5000");
  // : (false ? "http://127.0.0.1:5000" : "http://172.20.10.6:5000");
  : (true ? "http://127.0.0.1:5000" : "http://192.168.137.145:5000");
