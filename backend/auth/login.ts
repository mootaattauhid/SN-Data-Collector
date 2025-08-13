import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { secret } from "encore.dev/config";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const jwtSecret = secret("JWTSecret");

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: "super_admin" | "user";
    employeeId?: string;
  };
}

// Authenticates a user and returns a JWT token.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req): Promise<LoginResponse> => {
    const user = await authDB.queryRow<{
      id: string;
      username: string;
      password_hash: string;
      role: "super_admin" | "user";
      employee_id: string | null;
      active: boolean;
    }>`
      SELECT id, username, password_hash, role, employee_id, active
      FROM users 
      WHERE username = ${req.username}
    `;

    if (!user || !user.active) {
      throw APIError.unauthenticated("Invalid username or password");
    }

    const isValidPassword = await bcrypt.compare(req.password, user.password_hash);
    if (!isValidPassword) {
      throw APIError.unauthenticated("Invalid username or password");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret(),
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        employeeId: user.employee_id || undefined,
      },
    };
  }
);
