import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";
import type { UpdateSNRequest, SNEntry } from "./types";

// Updates an existing SN entry.
export const updateSN = api<UpdateSNRequest, SNEntry>(
  { auth: true, expose: true, method: "PUT", path: "/sn/:id" },
  async (req): Promise<SNEntry> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can update SN entries");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.sn !== undefined) {
      updates.push(`sn = $${paramIndex++}`);
      values.push(req.sn);
    }
    if (req.password !== undefined) {
      updates.push(`password = $${paramIndex++}`);
      values.push(req.password);
    }
    if (req.startDate !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(req.startDate);
    }
    if (req.endDate !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(req.endDate);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.id);

    const query = `
      UPDATE sn_list 
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, sn, password, start_date as "startDate", end_date as "endDate",
                status, data_count as "dataCount", sheet_count as "sheetCount",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const row = await snDB.rawQueryRow<SNEntry>(query, ...values);

    if (!row) {
      throw APIError.notFound("SN entry not found");
    }

    return row;
  }
);
