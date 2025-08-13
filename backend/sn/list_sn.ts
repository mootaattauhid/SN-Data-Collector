import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";
import type { SNEntry } from "./types";

interface ListSNResponse {
  entries: SNEntry[];
}

// Retrieves all SN entries with their current status and data counts.
export const listSN = api<void, ListSNResponse>(
  { auth: true, expose: true, method: "GET", path: "/sn" },
  async (): Promise<ListSNResponse> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can manage SN entries");
    }

    const rows = await snDB.queryAll<SNEntry>`
      SELECT id, sn, password, start_date as "startDate", end_date as "endDate", 
             status, data_count as "dataCount", sheet_count as "sheetCount",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM sn_list 
      ORDER BY created_at DESC
    `;

    return { entries: rows };
  }
);
