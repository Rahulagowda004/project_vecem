import axios from "axios";
import { getAuth } from "firebase/auth";
import { DatasetInfo, Files } from "../types/dataset";

const API_URL = "http://127.0.0.1:5000";

export interface DatasetForm extends Omit<DatasetInfo, "username"> {
  uid?: string;
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
  datasetInfo: Omit<DatasetForm, "uid">
) => {
  try {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) {
      throw new Error("User must be authenticated to upload datasets");
    }

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

    // Prepare dataset info with vectorization settings
    const datasetInfoWithUid = {
      uid: uid,
      dimensions:
        type !== "raw"
          ? parseInt(datasetInfo.dimensions?.toString() || "0")
          : undefined,
      vector_database: type !== "raw" ? datasetInfo.vector_database : undefined,
      model_name: type !== "raw" ? datasetInfo.model_name : undefined,
      dataset_info: {
        ...datasetInfo,
        datasetId: `${datasetInfo.name}_${Date.now()}`,
        isEdit: false,
      },
    };

    formData.append("type", type);
    formData.append("datasetInfo", JSON.stringify(datasetInfoWithUid));
    formData.append("uid", uid);

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

export const sendFirebaseUidAndEmail = async (
  uid: string,
  email: string,
  name: string
) => {
  try {
    const response = await axios.post(`${API_URL}/register-uid`, {
      uid,
      email,
      name,
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

export const checkDatasetNameAvailability = async (
  datasetName: string
): Promise<{ available: boolean; message: string }> => {
  try {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) {
      throw new Error("User must be authenticated to check dataset name");
    }

    const formattedName = datasetName.trim().replace(/\s+/g, "_");
    const response = await axios.get(
      `${API_URL}/check-dataset-name/${uid}/${formattedName}`
    );
    return response.data;
  } catch (error) {
    console.error("Dataset name check error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.detail || "Failed to check dataset name"
      );
    }
    throw error;
  }
};
