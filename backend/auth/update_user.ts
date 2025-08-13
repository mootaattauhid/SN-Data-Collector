import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";
import type { UpdateUserRequest, User } from "./types";
import * as bcrypt from "bcrypt";

// Updates a user (super admin only).
export const updateUser = api<UpdateUserRequest, User>(
  { auth: true, expose: true, method: "PUT", path: "/auth/users/:id" },
  async (req): Promise<User> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can update users");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(req.username);
    }
    if (req.password !== undefined) {
      const passwordHash = await bcrypt.hash(req.password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }
    if (req.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(req.role);
    }
    if (req.employeeId !== undefined) {
      updates.push(`employee_id = $${paramIndex++}`);
      values.push(req.employeeId || null);
    }
    if (req.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(req.active);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.id);

    const query = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, username, role, employee_id as "employeeId", active,
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const user = await authDB.rawQueryRow<User>(query, ...values);

    if (!user) {
      throw APIError.notFound("User not found");
    }

    return user;
  }
);
