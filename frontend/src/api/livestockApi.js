import { API_BASE_URL } from "../config.js";

const LIVESTOCK_API_URL = `${API_BASE_URL}/livestock`;

// Fetch all livestock
export const fetchLivestock = async () => {
  try {
    const response = await fetch(LIVESTOCK_API_URL);
    if (!response.ok) throw new Error("Failed to fetch livestock data");
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Fetch a single livestock by ID
export const fetchLivestockById = async (id) => {
  try {
    const response = await fetch(`${LIVESTOCK_API_URL}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch livestock details");
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Create a new livestock record
export const createLivestock = async (livestockData) => {
  try {
    const response = await fetch(LIVESTOCK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(livestockData),
    });
    if (!response.ok) throw new Error("Failed to create livestock");
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Update livestock details
export const updateLivestock = async (id, updatedData) => {
  try {
    const response = await fetch(`${LIVESTOCK_API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to update livestock");
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// 🚀 DELETE Livestock Request
export const deleteLivestock = async (id) => {
  try {
    const response = await fetch(`${LIVESTOCK_API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete livestock");
    return { message: "Deleted successfully" }; // Optionally return success message
  } catch (error) {
    throw error;
  }
};
