export interface DatasetInfo {
  name: string;
  description: string;
  datasetId: string;
  domain: string;
  license: string;
  file_type: string;
  dimensions?: number;
  vector_database?: string;
  model_name?: string;
  username: string;
}

export interface Files {
  raw: string[];
  vectorized: string[];
}

export interface Dataset {
  id: string; // Changed from _id to id
  dataset_id: string;
  dataset_info: DatasetInfo;
  upload_type: string;
  timestamp: Date;
  files: Files;
  uid: string;
}
