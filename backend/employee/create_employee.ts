import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { employeeDB } from "./db";
import type { CreateEmployeeRequest, Employee } from "./types";

// Creates a new employee (super admin only).
export const createEmployee = api<CreateEmployeeRequest, Employee>(
  { auth: true, expose: true, method: "POST", path: "/employees" },
  async (req): Promise<Employee> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can create employees");
    }

    try {
      const employee = await employeeDB.queryRow<Employee>`
        INSERT INTO employees (employee_id, name, nik, department, position, email, phone, address, hire_date)
        VALUES (${req.employeeId}, ${req.name}, ${req.nik}, ${req.department || null}, 
                ${req.position || null}, ${req.email || null}, ${req.phone || null}, 
                ${req.address || null}, ${req.hireDate || null})
        RETURNING id, employee_id as "employeeId", name, nik, department, position,
                  email, phone, address, hire_date as "hireDate", active,
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (!employee) {
        throw APIError.internal("Failed to create employee");
      }

      return employee;
    } catch (error: any) {
      if (error.message?.includes("unique")) {
        if (error.message.includes("employee_id")) {
          throw APIError.alreadyExists("Employee ID already exists");
        }
        if (error.message.includes("nik")) {
          throw APIError.alreadyExists("NIK already exists");
        }
      }
      throw APIError.internal("Failed to create employee", error);
    }
  }
);
