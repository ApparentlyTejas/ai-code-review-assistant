import { apiClient } from "./client";

export interface GitHubRepo {
  full_name: string;
  owner: string;
  name: string;
  private: boolean;
}

export interface GitHubPR {
  number: number;
  title: string;
  url: string;
  author: string;
  updated_at: string;
}

export async function listGitHubRepos(): Promise<GitHubRepo[]> {
  const { data } = await apiClient.get<GitHubRepo[]>("/github/repos");
  return data;
}

export async function listGitHubRepoPulls(owner: string, repo: string): Promise<GitHubPR[]> {
  const { data } = await apiClient.get<GitHubPR[]>(`/github/repos/${owner}/${repo}/pulls`);
  return data;
}

export async function createProjectFromGitHub(repoOwner: string, repoName: string): Promise<import("../types").Project> {
  const { data } = await apiClient.post("/projects/from-github", { repo_owner: repoOwner, repo_name: repoName });
  return data;
}

export async function connectGitHub(code: string): Promise<void> {
  await apiClient.post("/auth/github/connect", { code });
}
