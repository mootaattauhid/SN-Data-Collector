import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";
import { employeeDB } from "../employee/db";
import type { CreateUserRequest, User } from "./types";
import * as bcrypt from "bcrypt";

// Creates a new user (super admin only).
export const createUser = api<CreateUserRequest, User>(
  { auth: true, expose: true, method: "POST", path: "/auth/users" },
  async (req): Promise<User> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can create users");
    }

    // If role is user, validate that employee ID exists
    if (req.role === "user" && req.employeeId) {
      const employee = await employeeDB.queryRow`
        SELECT id FROM employees WHERE employee_id = ${req.employeeId} AND active = true
      `;
      
      if (!employee) {
        throw APIError.invalidArgument("Employee ID not found or inactive");
      }
    }

    const passwordHash = await bcrypt.hash(req.password, 10);

    try {
      const user = await authDB.queryRow<User>`
        INSERT INTO users (username, password_hash, role, employee_id)
        VALUES (${req.username}, ${passwordHash}, ${req.role}, ${req.employeeId || null})
        RETURNING id, username, role, employee_id as "employeeId", active,
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (!user) {
        throw APIError.internal("Failed to create user");
      }

      return user;
    } catch (error: any) {
      if (error.message?.includes("unique")) {
        throw APIError.alreadyExists("Username already exists");
      }
      throw APIError.internal("Failed to create user", error);
    }
  }
);
