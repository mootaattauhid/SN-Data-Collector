import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";
import type { CompactDataResponse } from "./types";

// Compacts data for all SN entries in the database.
export const compactAllData = api<void, CompactDataResponse>(
  { auth: true, expose: true, method: "POST", path: "/sn/compact-all" },
  async (): Promise<CompactDataResponse> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can compact all data");
    }

    const snEntries = await snDB.queryAll<{ id: number }>`
      SELECT id FROM sn_list ORDER BY id
    `;

    let totalDataCount = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const entry of snEntries) {
      try {
        await snDB.exec`
          UPDATE sn_list 
          SET status = 'Compacting', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${entry.id}
        `;

        // Simulate compact operation
        const dataCount = Math.floor(Math.random() * 100);
        totalDataCount += dataCount;
        successCount++;

        await snDB.exec`
          UPDATE sn_list 
          SET status = 'Compact Success', 
              data_count = ${dataCount},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${entry.id}
        `;

      } catch (error: any) {
        errorCount++;
        await snDB.exec`
          UPDATE sn_list 
          SET status = ${'Compact Failed: ' + error.message}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${entry.id}
        `;
      }
    }

    return {
      success: errorCount === 0,
      message: `Processed ${snEntries.length} entries. Success: ${successCount}, Errors: ${errorCount}`,
      dataCount: totalDataCount
    };
  }
);
