import { API_BASE_URL } from "../config";

export const fetchDatasetData = async (
  username: string,
  datasetname: string
) => {
  if (!username || !datasetname) {
    throw new Error("Invalid URL parameters");
  }
  const response = await fetch(`${API_BASE_URL}/dataset-click`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, datasetName: datasetname }),
  });
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server returned non-JSON response");
  }
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch dataset");
  }
  return response.json();
};
