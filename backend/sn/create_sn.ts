import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";
import type { CreateSNRequest, SNEntry } from "./types";

// Creates a new SN entry for data collection.
export const createSN = api<CreateSNRequest, SNEntry>(
  { auth: true, expose: true, method: "POST", path: "/sn" },
  async (req): Promise<SNEntry> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can create SN entries");
    }

    try {
      const row = await snDB.queryRow<SNEntry>`
        INSERT INTO sn_list (sn, password, start_date, end_date, updated_at)
        VALUES (${req.sn}, ${req.password}, ${req.startDate}, ${req.endDate}, CURRENT_TIMESTAMP)
        RETURNING id, sn, password, start_date as "startDate", end_date as "endDate",
                  status, data_count as "dataCount", sheet_count as "sheetCount",
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      if (!row) {
        throw APIError.internal("Failed to create SN entry");
      }

      return row;
    } catch (error: any) {
      if (error.message?.includes("unique")) {
        throw APIError.alreadyExists("SN already exists");
      }
      throw APIError.internal("Failed to create SN entry", error);
    }
  }
);
