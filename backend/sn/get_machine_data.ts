import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";
import type { MachineData } from "./types";

interface GetMachineDataRequest {
  sn?: Query<string>;
  limit?: Query<number>;
  offset?: Query<number>;
}

interface GetMachineDataResponse {
  data: MachineData[];
  total: number;
}

// Retrieves machine data with optional filtering and pagination.
export const getMachineData = api<GetMachineDataRequest, GetMachineDataResponse>(
  { auth: true, expose: true, method: "GET", path: "/machine-data" },
  async (req): Promise<GetMachineDataResponse> => {
    const auth = getAuthData()!;
    const limit = req.limit || 100;
    const offset = req.offset || 0;

    let whereClause = "";
    const params: any[] = [];
    let paramIndex = 1;

    // For regular users, filter by their employee ID
    if (auth.role === "user" && auth.employeeId) {
      whereClause = `WHERE employee_id = $${paramIndex++}`;
      params.push(auth.employeeId);
    }

    // For super admin, allow filtering by SN
    if (auth.role === "super_admin" && req.sn) {
      if (whereClause) {
        whereClause += ` AND sn = $${paramIndex++}`;
      } else {
        whereClause = `WHERE sn = $${paramIndex++}`;
      }
      params.push(req.sn);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM machine_data ${whereClause}`;
    const countResult = await snDB.rawQueryRow<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;

    // Get data
    const dataQuery = `
      SELECT id, sn, employee_id as "employeeId", timestamp, work_code as "workCode", verification, state, created_at as "createdAt"
      FROM machine_data 
      ${whereClause}
      ORDER BY timestamp DESC 
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    const data = await snDB.rawQueryAll<MachineData>(dataQuery, ...params, limit, offset);

    return { data, total };
  }
);
