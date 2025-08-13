import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";
import type { CompactDataResponse } from "./types";

interface CompactDataRequest {
  id: number;
}

// Compacts data on the remote server for a specific SN entry.
export const compactData = api<CompactDataRequest, CompactDataResponse>(
  { auth: true, expose: true, method: "POST", path: "/sn/:id/compact" },
  async (req): Promise<CompactDataResponse> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can compact data");
    }

    const snEntry = await snDB.queryRow`
      SELECT sn, password FROM sn_list WHERE id = ${req.id}
    `;

    if (!snEntry) {
      throw APIError.notFound("SN entry not found");
    }

    try {
      await snDB.exec`
        UPDATE sn_list 
        SET status = 'Compacting', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.id}
      `;

      const dataCount = await performCompact(snEntry.sn, snEntry.password);

      await snDB.exec`
        UPDATE sn_list 
        SET status = 'Compact Success', 
            data_count = ${dataCount},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.id}
      `;

      return {
        success: true,
        message: "Compact operation completed successfully",
        dataCount
      };

    } catch (error: any) {
      await snDB.exec`
        UPDATE sn_list 
        SET status = ${'Compact Failed: ' + error.message}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.id}
      `;

      return {
        success: false,
        message: error.message,
        dataCount: 0
      };
    }
  }
);

async function performCompact(sn: string, password: string): Promise<number> {
  try {
    // Initial request
    const initialResponse = await fetch("http://www.solutioncloud.co.id/sc_pro.asp");
    const cookies = extractCookies(initialResponse.headers.get('set-cookie') || '');

    // Login
    const loginData = new URLSearchParams();
    loginData.append('sn', sn);
    loginData.append('pass', password);

    const loginResponse = await fetch("http://www.solutioncloud.co.id/sc_pro.asp", {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: loginData
    });

    if (!loginResponse.ok) {
      throw new Error("Login failed");
    }

    const combinedCookies = combineCookies(cookies, loginResponse.headers.get('set-cookie') || '');

    // Perform compact
    const compactResponse = await fetch("http://www.solutioncloud.co.id/mesin.asp?hapus=1", {
      headers: { 'Cookie': combinedCookies }
    });

    if (!compactResponse.ok) {
      throw new Error("Compact operation failed");
    }

    // Count remaining data
    const viewResponse = await fetch("http://www.solutioncloud.co.id/view.asp", {
      headers: { 'Cookie': combinedCookies }
    });

    const content = await viewResponse.text();
    if (content.includes("window.location='default.asp'")) {
      return 0;
    }

    const lines = content.split('\n').filter(line => line.trim());
    return lines.length;

  } catch (error) {
    throw new Error(`Compact failed: ${error}`);
  }
}

function extractCookies(cookieHeader: string): string {
  if (!cookieHeader) return '';
  return cookieHeader.split(',')
    .map(cookie => cookie.split(';')[0].trim())
    .join('; ');
}

function combineCookies(existing: string, newCookies: string): string {
  const cookieMap = new Map<string, string>();
  
  existing.split('; ').forEach(cookie => {
    const [key, value] = cookie.split('=');
    if (key) cookieMap.set(key, value);
  });

  if (newCookies) {
    newCookies.split(',').forEach(cookie => {
      const [key, value] = cookie.split('=');
      if (key) cookieMap.set(key.trim(), value?.split(';')[0] || '');
    });
  }

  return Array.from(cookieMap.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
}
