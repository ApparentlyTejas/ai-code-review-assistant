import { apiClient } from "./client";
import type { User } from "../types";

export async function registerUser(email: string, password: string): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", { email, password });
  return data;
}

export async function loginUser(email: string, password: string): Promise<string> {
  const { data } = await apiClient.post<{ access_token: string }>("/auth/login", { email, password });
  return data.access_token;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}
