export interface Dataset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
  size: number;
  format: string;
  owner: string;
}
