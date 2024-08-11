export interface AuthMeResponse {
  id: string;
  username: string;
  role: keyof typeof Role;
  updated_at: string
  created_at: string
}