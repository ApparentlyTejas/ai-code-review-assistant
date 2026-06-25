export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Project {
  id: number;
  repo_owner: string;
  repo_name: string;
  created_at: string;
}

export interface PullRequest {
  number: number;
  title: string;
  url: string;
  author: string;
  updated_at: string;
}

export type FindingCategory = "bug" | "security" | "style" | "suggestion";
export type FindingSeverity = "low" | "medium" | "high" | "critical";
export type ReviewStatus = "pending" | "completed" | "failed";

export interface Finding {
  id: number;
  category: FindingCategory;
  severity: FindingSeverity;
  file_path: string;
  line_number: number | null;
  message: string;
  suggested_fix: string | null;
}

export interface Review {
  id: number;
  project_id: number;
  pr_number: number;
  pr_title: string;
  pr_url: string;
  status: ReviewStatus;
  error_message: string | null;
  model_used: string;
  created_at: string;
  findings: Finding[];
}

export interface ReviewSummary {
  id: number;
  pr_number: number;
  pr_title: string;
  status: ReviewStatus;
  created_at: string;
  finding_count: number;
}
