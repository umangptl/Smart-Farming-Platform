import { API_BASE_URL } from "../config.js";

const PADDOCK_API_URL = `${API_BASE_URL}/paddocks`;

// Fetch all paddock
export const fetchPaddock = async () => {
  try {
    const response = await fetch(PADDOCK_API_URL);
    if (!response.ok) throw new Error("Failed to fetch paddock data");
    return await response.json();
  } catch (error) {
    throw error;
  }
};