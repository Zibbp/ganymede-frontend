export enum Role {
  User = "user",
  Archiver = "archiver",
  Editor = "editor",
  Admin = "admin",
}

type Roles = keyof typeof Role;

export interface User {
  id: string;
  role: Role;
  username: string;
  created_at: string;
  updated_at: string;
}

