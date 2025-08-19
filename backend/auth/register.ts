import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { employeeDB } from "../employee/db";
import * as bcrypt from "bcrypt";

interface RegisterRequest {
  nik: string;
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    employeeId: string;
  };
}

// Registers a new user using NIK validation.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req): Promise<RegisterResponse> => {
    // Validate that employee exists with the provided NIK
    const employee = await employeeDB.queryRow<{
      id: string;
      employee_id: string;
      name: string;
      email: string | null;
      active: boolean;
    }>`
      SELECT id, employee_id, name, email, active
      FROM employees 
      WHERE nik = ${req.nik} AND active = true
    `;

    if (!employee) {
      throw APIError.invalidArgument("NIK not found or employee is inactive");
    }

    // Check if user already exists with this username
    const existingUser = await authDB.queryRow`
      SELECT id FROM users WHERE username = ${req.username}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("Username already exists");
    }

    // Check if user already exists with this employee ID
    const existingEmployeeUser = await authDB.queryRow`
      SELECT id FROM users WHERE employee_id = ${employee.employee_id}
    `;

    if (existingEmployeeUser) {
      throw APIError.alreadyExists("An account already exists for this employee");
    }

    // Validate email matches employee record if employee has email
    if (employee.email && employee.email !== req.email) {
      throw APIError.invalidArgument("Email does not match employee record");
    }

    const passwordHash = await bcrypt.hash(req.password, 10);

    try {
      const user = await authDB.queryRow<{
        id: string;
        username: string;
        employee_id: string;
      }>`
        INSERT INTO users (username, password_hash, role, employee_id)
        VALUES (${req.username}, ${passwordHash}, 'user', ${employee.employee_id})
        RETURNING id, username, employee_id
      `;

      if (!user) {
        throw APIError.internal("Failed to create user account");
      }

      return {
        success: true,
        message: `Account created successfully for ${employee.name}`,
        user: {
          id: user.id,
          username: user.username,
          email: req.email,
          employeeId: user.employee_id,
        },
      };
    } catch (error: any) {
      if (error.message?.includes("unique")) {
        throw APIError.alreadyExists("Username already exists");
      }
      throw APIError.internal("Failed to create user account", error);
    }
  }
);
