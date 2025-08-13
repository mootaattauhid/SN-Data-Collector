import { authHandler } from "encore.dev/auth";
import { Header, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { authDB } from "./db";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const jwtSecret = secret("JWTSecret");

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  role: "super_admin" | "user";
  employeeId?: string;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const token = data.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret()) as any;
      
      const user = await authDB.queryRow<{
        id: string;
        role: "super_admin" | "user";
        employee_id: string | null;
      }>`
        SELECT id, role, employee_id 
        FROM users 
        WHERE id = ${decoded.userId} AND active = true
      `;

      if (!user) {
        throw APIError.unauthenticated("user not found or inactive");
      }

      return {
        userID: user.id,
        role: user.role,
        employeeId: user.employee_id || undefined,
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err);
    }
  }
);
