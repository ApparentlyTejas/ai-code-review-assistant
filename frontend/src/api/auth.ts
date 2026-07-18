import { apiClient } from "./client";
import type { User } from "../types";

export async function registerUser(email: string, password: string): Promise<void> {
  await apiClient.post("/auth/register", { email, password });
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.get(`/auth/verify?token=${encodeURIComponent(token)}`);
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post("/auth/resend-verification", { email });
}

export async function loginUser(email: string, password: string): Promise<void> {
  await apiClient.post("/auth/login", { email, password });
}

export async function logoutUser(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function loginWithGoogle(accessToken: string): Promise<void> {
  await apiClient.post("/auth/google", { access_token: accessToken });
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}
