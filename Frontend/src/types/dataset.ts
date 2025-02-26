export interface Dataset {
  id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  updatedAt: string;
  createdAt: string | Date;
  size: number;
  format: string;
  owner: string;
  datasetType?: string;
  vectorizedSettings?: {
    dimensions: number;
    vectorDatabase: string;
  };
  domain?: string;
  fileType?: string;
  status?: {
    uploadComplete: boolean;
    processingComplete: boolean;
  };
  downloads?: {
    raw?: {
      url: string;
      size: string;
      format: string;
    };
    vectorized?: {
      url: string;
      size: string;
      format: string;
    };
  };
}
