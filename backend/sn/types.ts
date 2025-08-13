export interface SNEntry {
  id: number;
  sn: string;
  password: string;
  startDate: Date;
  endDate: Date;
  status: string;
  dataCount: number;
  sheetCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MachineData {
  id: number;
  sn: string;
  employeeId: string;
  timestamp: Date;
  workCode?: string;
  verification?: string;
  state?: string;
  createdAt: Date;
}

export interface CreateSNRequest {
  sn: string;
  password: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateSNRequest {
  id: number;
  sn?: string;
  password?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CollectDataResponse {
  success: boolean;
  message: string;
  newRecords: number;
}

export interface CompactDataResponse {
  success: boolean;
  message: string;
  dataCount: number;
}
