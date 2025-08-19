import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { employeeDB } from "./db";
import type { Employee } from "./types";

interface ListEmployeesResponse {
  employees: Employee[];
}

// Lists all employees (super admin only).
export const listEmployees = api<void, ListEmployeesResponse>(
  { auth: true, expose: true, method: "GET", path: "/employees" },
  async (): Promise<ListEmployeesResponse> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can list employees");
    }

    const employees = await employeeDB.queryAll<Employee>`
      SELECT id, employee_id as "employeeId", name, nik, department, position, 
             email, phone, address, hire_date as "hireDate", active,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM employees 
      ORDER BY name ASC
    `;

    return { employees };
  }
);
