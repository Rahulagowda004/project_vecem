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
  metadata: DatasetMetadata
) => {
  const formData = new FormData();

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

  Object.entries(metadata).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  formData.append("upload_type", type);

  const response = await fetch(`${API_URL}/upload-dataset-files`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to upload files");
  }

  const result = await response.json();
  return {
    success: true,
    message: `Successfully uploaded ${type} files`,
    data: result,
  };
};
