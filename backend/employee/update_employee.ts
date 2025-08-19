import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { employeeDB } from "./db";
import type { UpdateEmployeeRequest, Employee } from "./types";

// Updates an employee (super admin only).
export const updateEmployee = api<UpdateEmployeeRequest, Employee>(
  { auth: true, expose: true, method: "PUT", path: "/employees/:id" },
  async (req): Promise<Employee> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can update employees");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.employeeId !== undefined) {
      updates.push(`employee_id = $${paramIndex++}`);
      values.push(req.employeeId);
    }
    if (req.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(req.name);
    }
    if (req.nik !== undefined) {
      updates.push(`nik = $${paramIndex++}`);
      values.push(req.nik);
    }
    if (req.department !== undefined) {
      updates.push(`department = $${paramIndex++}`);
      values.push(req.department || null);
    }
    if (req.position !== undefined) {
      updates.push(`position = $${paramIndex++}`);
      values.push(req.position || null);
    }
    if (req.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(req.email || null);
    }
    if (req.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(req.phone || null);
    }
    if (req.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(req.address || null);
    }
    if (req.hireDate !== undefined) {
      updates.push(`hire_date = $${paramIndex++}`);
      values.push(req.hireDate || null);
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
      UPDATE employees 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, employee_id as "employeeId", name, nik, department, position,
                email, phone, address, hire_date as "hireDate", active,
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const employee = await employeeDB.rawQueryRow<Employee>(query, ...values);

    if (!employee) {
      throw APIError.notFound("Employee not found");
    }

    return employee;
  }
);
