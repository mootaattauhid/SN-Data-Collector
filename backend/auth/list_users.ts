import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";
import type { User } from "./types";

interface ListUsersResponse {
  users: User[];
}

// Lists all users (super admin only).
export const listUsers = api<void, ListUsersResponse>(
  { auth: true, expose: true, method: "GET", path: "/auth/users" },
  async (): Promise<ListUsersResponse> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can list users");
    }

    const users = await authDB.queryAll<User>`
      SELECT id, username, role, employee_id as "employeeId", active,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users 
      ORDER BY created_at DESC
    `;

    return { users };
  }
);
