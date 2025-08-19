import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { employeeDB } from "./db";

interface DeleteEmployeeRequest {
  id: string;
}

// Deletes an employee (super admin only).
export const deleteEmployee = api<DeleteEmployeeRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/employees/:id" },
  async (req): Promise<void> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can delete employees");
    }

    const result = await employeeDB.exec`
      DELETE FROM employees WHERE id = ${req.id}
    `;
  }
);
