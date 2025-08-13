import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { snDB } from "./db";
import type { CollectDataResponse } from "./types";

interface CollectDataRequest {
  id: number;
}

// Collects data from the remote server for a specific SN entry.
export const collectData = api<CollectDataRequest, CollectDataResponse>(
  { auth: true, expose: true, method: "POST", path: "/sn/:id/collect" },
  async (req): Promise<CollectDataResponse> => {
    const auth = getAuthData()!;
    
    if (auth.role !== "super_admin") {
      throw APIError.permissionDenied("Only super admins can collect data");
    }

    // Get SN entry
    const snEntry = await snDB.queryRow`
      SELECT sn, password, start_date, end_date 
      FROM sn_list 
      WHERE id = ${req.id}
    `;

    if (!snEntry) {
      throw APIError.notFound("SN entry not found");
    }

    try {
      // Update status to processing
      await snDB.exec`
        UPDATE sn_list 
        SET status = 'Processing', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.id}
      `;

      // Get latest date for this SN
      const latestData = await snDB.queryRow<{ latestDate: Date }>`
        SELECT MAX(timestamp) as "latestDate"
        FROM machine_data 
        WHERE sn = ${snEntry.sn}
      `;

      const startDate = latestData?.latestDate 
        ? new Date(latestData.latestDate.getTime() + 1000)
        : new Date(snEntry.start_date);

      // Simulate data collection (replace with actual HTTP requests)
      const newRecords = await collectDataFromServer(
        snEntry.sn, 
        snEntry.password, 
        startDate, 
        new Date(snEntry.end_date)
      );

      // Update status and counts
      const dataCount = await snDB.queryRow<{ count: number }>`
        SELECT COUNT(*) as count FROM machine_data WHERE sn = ${snEntry.sn}
      `;

      await snDB.exec`
        UPDATE sn_list 
        SET status = ${'Connected (+' + newRecords + ')'}, 
            data_count = ${dataCount?.count || 0},
            sheet_count = ${dataCount?.count || 0},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.id}
      `;

      return {
        success: true,
        message: `Successfully collected ${newRecords} new records`,
        newRecords
      };

    } catch (error: any) {
      // Update status to error
      await snDB.exec`
        UPDATE sn_list 
        SET status = ${'Error: ' + error.message}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${req.id}
      `;

      return {
        success: false,
        message: error.message,
        newRecords: 0
      };
    }
  }
);

async function collectDataFromServer(
  sn: string, 
  password: string, 
  startDate: Date, 
  endDate: Date
): Promise<number> {
  try {
    // Initial request to get cookies
    const initialResponse = await fetch("http://www.solutioncloud.co.id/sc_pro.asp");
    const cookies = extractCookies(initialResponse.headers.get('set-cookie') || '');

    // Login request
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

    // Get data
    const dataResponse = await fetch("http://www.solutioncloud.co.id/view.asp", {
      headers: { 'Cookie': combinedCookies }
    });

    const content = await dataResponse.text();
    return await processAndStoreData(content, sn, startDate, endDate);

  } catch (error) {
    throw new Error(`Data collection failed: ${error}`);
  }
}

async function processAndStoreData(
  content: string, 
  sn: string, 
  startDate: Date, 
  endDate: Date
): Promise<number> {
  const lines = content.split('\n').filter(line => line.trim());
  let newRecords = 0;

  for (const line of lines) {
    const rowData = line.trim().split('\t');
    if (rowData.length < 2) continue;

    const timestamp = new Date(rowData[1].replace(' ', 'T'));
    if (timestamp < startDate || timestamp > endDate) continue;

    try {
      await snDB.exec`
        INSERT INTO machine_data (sn, employee_id, timestamp, work_code, verification, state)
        VALUES (${sn}, ${rowData[0]}, ${timestamp}, ${rowData[2] || null}, ${rowData[3] || null}, ${rowData[4] || null})
        ON CONFLICT (sn, employee_id, timestamp) DO NOTHING
      `;
      newRecords++;
    } catch (error) {
      // Ignore duplicate entries
    }
  }

  return newRecords;
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
