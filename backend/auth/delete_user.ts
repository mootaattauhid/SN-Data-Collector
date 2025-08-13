import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";

interface DeleteUserRequest {
  id: string;
}

// Deletes a user (super admin only).
export const deleteUser = api<DeleteUserRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/auth/users/:id" },
  async (req): Promise<void> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can delete users");
    }

    // Prevent deleting self
    if (auth.userID === req.id) {
      throw APIError.invalidArgument("Cannot delete your own account");
    }

    const result = await authDB.exec`
      DELETE FROM users WHERE id = ${req.id}
    `;
  }
);
