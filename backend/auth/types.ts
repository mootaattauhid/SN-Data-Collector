export interface User {
  id: string;
  username: string;
  role: "super_admin" | "user";
  employeeId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: "super_admin" | "user";
  employeeId?: string;
}

export interface UpdateUserRequest {
  id: string;
  username?: string;
  password?: string;
  role?: "super_admin" | "user";
  employeeId?: string;
  active?: boolean;
}
