import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { employeeDB } from "./db";
import type { Employee } from "./types";

interface GetEmployeeRequest {
  employeeId: string;
}

// Gets employee information by employee ID.
export const getEmployeeById = api<GetEmployeeRequest, Employee>(
  { auth: true, expose: true, method: "GET", path: "/employees/by-id/:employeeId" },
  async (req): Promise<Employee> => {
    const auth = getAuthData()!;
    
    // Users can only get their own employee data
    if (auth.role === "user" && auth.employeeId !== req.employeeId) {
      throw APIError.permissionDenied("You can only access your own employee data");
    }

    const employee = await employeeDB.queryRow<Employee>`
      SELECT id, employee_id as "employeeId", name, nik, department, position,
             email, phone, address, hire_date as "hireDate", active,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM employees 
      WHERE employee_id = ${req.employeeId} AND active = true
    `;

    if (!employee) {
      throw APIError.notFound("Employee not found");
    }

    return employee;
  }
);
