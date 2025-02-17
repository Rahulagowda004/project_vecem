import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export interface ProfileData {
  stats: {
    projects: number;
    followers: number;
    following: number;
    contributions: number;
  };
  folders: Array<{
    id: number;
    name: string;
    files: number;
    lastModified: string;
    size: string;
    type: "folder" | "file";
  }>;
  about: string;
}

export const profileService = {
  async getProfileData(): Promise<ProfileData> {
    const response = await axios.get(`${API_BASE_URL}/api/profile`);
    return response.data;
  },
};
