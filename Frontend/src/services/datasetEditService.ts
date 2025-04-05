export interface Dataset {
  _id: string;
  dataset_info: {
    name: string;
    description: string;
    domain: string;
    file_type: string;
  };
  dataset_type: string;
  files?: {
    raw: string[];
    vectorized: string[];
  };
  vectorized_settings?: {
    dimensions: number;
    vectorDatabase: string;
    modelName: string;
  };
}

interface DatasetMetadata {
  datasetId: string;
  name: string;
  description: string;
  domain: string;
  file_type: string;
  model_name: string;
  dimensions: number;
  vector_database: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  files: string[];
}

const API_URL = "http://127.0.0.1:5000";

export const fetchDatasetForEdit = async (
  uid: string,
  datasetName: string
): Promise<Dataset> => {
  const response = await fetch(`${API_URL}/dataset-edit-click`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ uid, datasetName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch dataset");
  }

  return response.json();
};

export const updateDataset = async (
  datasetId: string,
  userId: string,
  updateData: any
) => {
  // Structure the request body according to the MongoDB update schema
  const requestBody = {
    userId,
    name: updateData.name,
    description: updateData.description,
    domain: updateData.domain,
    fileType: updateData.fileType,
    datasetType: updateData.datasetType.toLowerCase(),
    vectorizedSettings: updateData.vectorizedSettings
      ? {
          dimensions: parseInt(updateData.vectorizedSettings.dimensions),
          vectorDatabase: updateData.vectorizedSettings.vectorDatabase,
          modelName: updateData.vectorizedSettings.modelName,
        }
      : undefined,
  };

  const response = await fetch(`${API_URL}/update-dataset/${datasetId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to update dataset");
  }

  return response.json();
};

export const deleteDataset = async (
  datasetId: string,
  userId: string,
  datasetName: string
) => {
  const response = await fetch(`${API_URL}/api/datasets/${datasetId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, datasetName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to delete dataset");
  }

  return response.json();
};

export const uploadDatasetFiles = async (
  rawFiles: FileList | null,
  vectorizedFiles: FileList | null,
  type: "raw" | "vectorized",
  metadata: DatasetMetadata & { userId: string }
) => {
  try {
    if (!metadata.userId) {
      throw new Error("User ID is required");
    }

    const formData = new FormData();

    console.log(`Setting up ${type} files for upload:`, {
      rawFiles: rawFiles?.length || 0,
      vectorizedFiles: vectorizedFiles?.length || 0,
      fileType: metadata.file_type
    });

    // Add files based on type - make sure to use the correct field names
    if (type === "raw" && rawFiles) {
      Array.from(rawFiles).forEach((file) => {
        formData.append("raw_files", file);
      });
    } else if (type === "vectorized" && vectorizedFiles) {
      Array.from(vectorizedFiles).forEach((file) => {
        formData.append("vectorized_files", file);
      });
    }

    // Add dataset info
    formData.append("uid", metadata.userId);
    formData.append("type", type);
    formData.append(
      "datasetInfo",
      JSON.stringify({
        datasetId: metadata.datasetId,
        name: metadata.name,
        description: metadata.description,
        domain: metadata.domain,
        file_type: metadata.file_type,
        isEdit: true,
      })
    );

    const response = await fetch(`${API_URL}/upload/edit`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: `Server returned ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.detail || "Failed to upload files");
    }

    return await response.json();
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};
