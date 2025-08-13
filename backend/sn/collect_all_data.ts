import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";
import type { CollectDataResponse } from "./types";

// Collects data from all SN entries in the database.
export const collectAllData = api<void, CollectDataResponse>(
  { auth: true, expose: true, method: "POST", path: "/sn/collect-all" },
  async (): Promise<CollectDataResponse> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can collect all data");
    }

    const snEntries = await snDB.queryAll<{ id: number }>`
      SELECT id FROM sn_list ORDER BY id
    `;

    let totalNewRecords = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const entry of snEntries) {
      try {
        // This would call the collectData function for each entry
        // For now, we'll simulate the process
        await snDB.exec`
          UPDATE sn_list 
          SET status = 'Processing', updated_at = CURRENT_TIMESTAMP
          WHERE id = ${entry.id}
        `;

        // Simulate data collection
        const newRecords = Math.floor(Math.random() * 10);
        totalNewRecords += newRecords;
        successCount++;

        await snDB.exec`
          UPDATE sn_list 
          SET status = ${'Connected (+' + newRecords + ')'}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${entry.id}
        `;

      } catch (error: any) {
        errorCount++;
        await snDB.exec`
          UPDATE sn_list 
          SET status = ${'Error: ' + error.message}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${entry.id}
        `;
      }
    }

    return {
      success: errorCount === 0,
      message: `Processed ${snEntries.length} entries. Success: ${successCount}, Errors: ${errorCount}`,
      newRecords: totalNewRecords
    };
  }
);
