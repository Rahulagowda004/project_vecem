import axios from "axios";
import { getAuth } from "firebase/auth";
import { DatasetInfo, Files } from "../types/dataset";
import { API_BASE_URL } from "../config";

const API_URL = API_BASE_URL;

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

/**
 * Uploads entire folder(s) as a dataset
 * @param folderContents Files from selected folders
 * @param type Type of dataset being uploaded ("raw", "vectorized", or "both")
 * @param datasetInfo Dataset metadata
 * @returns Upload response with success status and message
 */
export const uploadFolders = async (
  folderContents: { [key: string]: File[] },
  type: "raw" | "vectorized" | "both",
  datasetInfo: Omit<DatasetForm, "uid">
): Promise<UploadResponse> => {
  try {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) {
      throw new Error("User must be authenticated to upload folders");
    }

    const formData = new FormData();

    // Group files by their parent folders to maintain structure
    const folderStructure: { [key: string]: { [key: string]: File[] } } = {
      raw: {},
      vectorized: {},
    };

    // Process files to maintain folder structure
    if (type === "both" || type === "raw") {
      const rawFiles = folderContents.raw || [];
      rawFiles.forEach((file) => {
        const path = file.webkitRelativePath;
        const folderPath = path.split("/")[0]; // Top-level folder

        if (!folderStructure.raw[folderPath]) {
          folderStructure.raw[folderPath] = [];
        }
        folderStructure.raw[folderPath].push(file);
      });
    }

    if (type === "both" || type === "vectorized") {
      const vectorizedFiles = folderContents.vectorized || [];
      vectorizedFiles.forEach((file) => {
        const path = file.webkitRelativePath;
        const folderPath = path.split("/")[0]; // Top-level folder

        if (!folderStructure.vectorized[folderPath]) {
          folderStructure.vectorized[folderPath] = [];
        }
        folderStructure.vectorized[folderPath].push(file);
      });
    }

    // Add files based on type while preserving folder structure
    if (type === "both") {
      // Add raw files
      Object.entries(folderStructure.raw).forEach(([folderName, files]) => {
        formData.append("raw_folder_names", folderName);
        files.forEach((file) => {
          // Use relative path to maintain folder structure
          formData.append("raw_files", file, file.webkitRelativePath);
        });
      });

      // Add vectorized files
      Object.entries(folderStructure.vectorized).forEach(
        ([folderName, files]) => {
          formData.append("vectorized_folder_names", folderName);
          files.forEach((file) => {
            formData.append("vectorized_files", file, file.webkitRelativePath);
          });
        }
      );
    } else {
      // Add files for single type
      const filesType = type === "raw" ? "raw" : "vectorized";
      Object.entries(folderStructure[filesType]).forEach(
        ([folderName, files]) => {
          formData.append("folder_names", folderName);
          files.forEach((file) => {
            formData.append("files", file, file.webkitRelativePath);
          });
        }
      );
    }

    // Add metadata about folders
    const foldersMeta = {
      raw: Object.keys(folderStructure.raw),
      vectorized: Object.keys(folderStructure.vectorized),
    };
    formData.append("folders_meta", JSON.stringify(foldersMeta));

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
    formData.append("isFolder", "true");

    // For debugging - log what we're about to upload
    console.log("Uploading folders:", {
      type,
      rawFoldersCount: Object.keys(folderStructure.raw).length,
      vectorizedFoldersCount: Object.keys(folderStructure.vectorized).length,
      rawFilesCount:
        type === "both" || type === "raw" ? folderContents.raw?.length : 0,
      vectorizedFilesCount:
        type === "both" || type === "vectorized"
          ? folderContents.vectorized?.length
          : 0,
    });

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100)
        );
        console.log(`Folder Upload Progress: ${percentCompleted}%`);
      },
      // Add longer timeout for large folder uploads
      timeout: 300000, // 5 minutes
    });

    console.log("Folder Upload Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Folder Upload Error:", error);
    // Enhanced error logging to help with debugging
    if (axios.isAxiosError(error)) {
      console.error("Axios Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 413) {
        throw new Error(
          "Files too large. Try uploading smaller folders or fewer files."
        );
      } else if (error.response) {
        throw new Error(
          error.response?.data?.detail ||
            `Server error (${error.response.status}): Failed to upload folder`
        );
      } else if (error.request) {
        throw new Error(
          "No response from server. Please check your connection and try again."
        );
      } else {
        throw new Error("Failed to upload folder: " + error.message);
      }
    }
    throw new Error(
      "Failed to upload folder: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
};
