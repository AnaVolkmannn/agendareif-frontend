export type Role = "ADMIN" | "PROFESSIONAL";

export interface Session {
  token: string;
  role: Role;
  id: number;
  email: string;
  mustChangePassword: boolean;
}
