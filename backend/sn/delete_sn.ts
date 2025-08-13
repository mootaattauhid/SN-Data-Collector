import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";

interface DeleteSNRequest {
  id: number;
}

// Deletes an SN entry and all associated machine data.
export const deleteSN = api<DeleteSNRequest, void>(
  { auth: true, expose: true, method: "DELETE", path: "/sn/:id" },
  async (req): Promise<void> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can delete SN entries");
    }

    await snDB.exec`BEGIN`;

    try {
      // First delete associated machine data
      await snDB.exec`
        DELETE FROM machine_data 
        WHERE sn = (SELECT sn FROM sn_list WHERE id = ${req.id})
      `;

      // Then delete the SN entry
      const result = await snDB.exec`
        DELETE FROM sn_list WHERE id = ${req.id}
      `;

      await snDB.exec`COMMIT`;
    } catch (error) {
      await snDB.exec`ROLLBACK`;
      throw APIError.internal("Failed to delete SN entry", error);
    }
  }
);
