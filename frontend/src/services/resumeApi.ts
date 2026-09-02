/**
 * src/services/resumeApi.ts
 * -------------------------
 * Client API for Phase 2 Resume Intelligence endpoints.
 */

import apiClient from "@/services/api";

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration?: string;
  location?: string;
  bullets: string[];
  technologies: string[];
}

export interface ProjectItem {
  title: string;
  description?: string;
  technologies: string[];
  bullets: string[];
  link?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field_of_study?: string;
  graduation_year?: string;
  gpa?: string;
}

export interface CertificationItem {
  name: string;
  issuer?: string;
  year?: string;
  url?: string;
}

export interface QualityScoreBreakdown {
  overall_score: number;
  completeness_score: number;
  skills_score: number;
  impact_score: number;
  structure_score: number;
  strengths: string[];
  improvements: string[];
}

export interface ParsedResumeData {
  personal_info: PersonalInfo;
  skills: string[];
  technologies: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
}

export interface ResumeDetail {
  id: string;
  user_id: string;
  version: number;
  filename: string;
  file_size_bytes: number;
  page_count: number;
  status: string;
  raw_text: string;
  parsed_data: ParsedResumeData;
  quality_score: QualityScoreBreakdown;
  created_at: string;
  updated_at: string;
}

export const resumeApi = {
  async uploadResume(
    file: File,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number | undefined }) => void
  ): Promise<ResumeDetail> {
    const formData = new FormData();
    formData.append("file", file);

    const config: Record<string, any> = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    if (onUploadProgress) {
      config.onUploadProgress = onUploadProgress;
    }

    const response = await apiClient.post("/api/v1/resume/upload", formData, config);
    return response.data.data.resume;
  },

  async getLatestResume(): Promise<ResumeDetail | null> {
    const response = await apiClient.get("/api/v1/resume/latest");
    return response.data.data.resume ?? null;
  },

  async getResumeById(id: string): Promise<ResumeDetail> {
    const response = await apiClient.get(`/api/v1/resume/${id}`);
    return response.data.data.resume;
  },

  async deleteResume(id: string): Promise<boolean> {
    const response = await apiClient.delete(`/api/v1/resume/${id}`);
    return response.data.data.deleted;
  },

  getPreviewUrl(id: string): string {
    return `/api/v1/resume/${id}/preview`;
  },
};
