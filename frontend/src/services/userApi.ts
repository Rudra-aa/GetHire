import apiClient from "@/services/api";

export interface ResetProgressResponse {
  reset: boolean;
  cancelled_interviews: number;
  cancelled_assessments: number;
  archived_assessments: number;
  timestamp: string;
}

export const userApi = {
  resetProgress: async (): Promise<ResetProgressResponse> => {
    const res = await apiClient.post("/api/v1/users/me/reset-progress");
    return res.data.data;
  },
};
