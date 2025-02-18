export interface DatasetForm {
  name: string;
  description: string;
  domain: string;
  dimensions?: number;
  vectorDatabase?: string;
  datasetId?: string;
  file_type?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  files: string[];
}

export async function uploadDataset(
  rawFiles: FileList | null,
  vectorizedFiles: FileList | null,
  type: "raw" | "vectorized" | "both",
  datasetInfo: DatasetForm
): Promise<UploadResponse> {
  const formData = new FormData();

  if (type === "both") {
    if (rawFiles) {
      for (let i = 0; i < rawFiles.length; i++) {
        formData.append("raw_files", rawFiles[i]);
      }
    }

    if (vectorizedFiles) {
      for (let i = 0; i < vectorizedFiles.length; i++) {
        formData.append("vectorized_files", vectorizedFiles[i]);
      }
    }
  } else {
    const files = type === "raw" ? rawFiles : vectorizedFiles;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }
  }

  formData.append("type", type);
  formData.append("datasetInfo", JSON.stringify(datasetInfo));

  try {
    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Upload failed");
    }

    const result = await response.json();
    console.log("Upload result:", result);
    return result;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
