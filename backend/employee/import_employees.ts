import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { employeeDB } from "./db";
import type { ImportEmployeeData, ImportEmployeeResponse } from "./types";

interface ImportEmployeesRequest {
  employees: ImportEmployeeData[];
}

// Imports multiple employees from CSV data (super admin only).
export const importEmployees = api<ImportEmployeesRequest, ImportEmployeeResponse>(
  { auth: true, expose: true, method: "POST", path: "/employees/import" },
  async (req): Promise<ImportEmployeeResponse> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can import employees");
    }

    let imported = 0;
    const errors: string[] = [];

    for (const [index, empData] of req.employees.entries()) {
      try {
        // Validate required fields
        if (!empData.employeeId || !empData.name || !empData.nik) {
          errors.push(`Row ${index + 1}: Missing required fields (Employee ID, Name, or NIK)`);
          continue;
        }

        // Parse hire date if provided
        let hireDate: Date | null = null;
        if (empData.hireDate) {
          hireDate = new Date(empData.hireDate);
          if (isNaN(hireDate.getTime())) {
            errors.push(`Row ${index + 1}: Invalid hire date format`);
            continue;
          }
        }

        // Insert employee
        await employeeDB.exec`
          INSERT INTO employees (employee_id, name, nik, department, position, email, phone, address, hire_date)
          VALUES (${empData.employeeId}, ${empData.name}, ${empData.nik}, 
                  ${empData.department || null}, ${empData.position || null}, 
                  ${empData.email || null}, ${empData.phone || null}, 
                  ${empData.address || null}, ${hireDate})
          ON CONFLICT (employee_id) DO UPDATE SET
            name = EXCLUDED.name,
            nik = EXCLUDED.nik,
            department = EXCLUDED.department,
            position = EXCLUDED.position,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            address = EXCLUDED.address,
            hire_date = EXCLUDED.hire_date,
            updated_at = CURRENT_TIMESTAMP
        `;

        imported++;
      } catch (error: any) {
        if (error.message?.includes("unique") && error.message.includes("nik")) {
          errors.push(`Row ${index + 1}: NIK ${empData.nik} already exists`);
        } else {
          errors.push(`Row ${index + 1}: ${error.message}`);
        }
      }
    }

    return {
      success: errors.length === 0,
      message: `Import completed. ${imported} employees imported successfully.`,
      imported,
      errors
    };
  }
);
