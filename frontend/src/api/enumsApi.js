import { API_BASE_URL } from "../config.js";

const ENUMS_API_URL = `${API_BASE_URL}/enums`;

export const fetchEnums = async () => {
  try {
    const response = await fetch(ENUMS_API_URL);
    if (!response.ok) throw new Error("Failed to fetch enums data");
    return await response.json();
  } catch (error) {
    throw error;
  }
};