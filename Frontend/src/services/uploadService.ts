import axios from "axios";

const API_URL = "http://localhost:5000";

export interface DatasetForm {
  name: string;
  description: string;
  domain: string;
  dimensions?: number;
  vectorDatabase?: string;
  file_type?: string;
  datasetId?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  files: string[];
}

export const uploadDataset = async (
  rawFiles: FileList | null,
  vectorizedFiles: FileList | null,
  type: "raw" | "vectorized" | "both",
  datasetInfo: DatasetForm
) => {
  try {
    const formData = new FormData();

    // Add files based on type
    if (type === "both") {
      if (rawFiles) {
        Array.from(rawFiles).forEach((file) => {
          formData.append("raw_files", file);
        });
      }
      if (vectorizedFiles) {
        Array.from(vectorizedFiles).forEach((file) => {
          formData.append("vectorized_files", file);
        });
      }
    } else {
      if (type === "raw" && rawFiles) {
        Array.from(rawFiles).forEach((file) => {
          formData.append("files", file);
        });
      }
      if (type === "vectorized" && vectorizedFiles) {
        Array.from(vectorizedFiles).forEach((file) => {
          formData.append("files", file);
        });
      }
    }

    // Add dataset info
    formData.append("type", type);
    formData.append("datasetInfo", JSON.stringify(datasetInfo));

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100)
        );
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    console.log("Upload Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload Error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail || "Failed to upload dataset"
      );
    }
    throw error;
  }
};

export const sendFirebaseUid = async (uid: string) => {
  try {
    const response = await axios.post(`${API_URL}/register-uid`, { uid });
    console.log("UID sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending UID:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || "Failed to send UID");
    }
    throw error;
  }
};

export const sendFirebaseUidAndEmail = async (uid: string, email: string) => {
  try {
    const response = await axios.post(`${API_URL}/register-uid`, {
      uid,
      email,
    });
    console.log("UID and email sent successfully:", response.data);
  } catch (error) {
    console.error("Error sending UID and email:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail || "Failed to send UID and email"
      );
    }
    throw error;
  }
};
