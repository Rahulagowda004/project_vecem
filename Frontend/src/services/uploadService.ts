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

export const uploadDataset = async (
  rawFiles: FileList | null,
  vectorizedFiles: FileList | null,
  type: "raw" | "vectorized" | "both",
  formData: DatasetForm
) => {
  try {
    // Create FormData object
    const data = new FormData();

    // Append form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    // Append files
    if (rawFiles) {
      Array.from(rawFiles).forEach((file) => {
        data.append("raw_files", file);
      });
    }

    if (vectorizedFiles) {
      Array.from(vectorizedFiles).forEach((file) => {
        data.append("vectorized_files", file);
      });
    }

    // Send request to your API endpoint
    const response = await fetch("/api/upload-dataset", {
      method: "POST",
      body: data,
    });

    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, message: "Failed to upload dataset" };
  }
};
