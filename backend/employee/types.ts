export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  nik: string;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
  address?: string;
  hireDate?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeRequest {
  employeeId: string;
  name: string;
  nik: string;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
  address?: string;
  hireDate?: Date;
}

export interface UpdateEmployeeRequest {
  id: string;
  employeeId?: string;
  name?: string;
  nik?: string;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
  address?: string;
  hireDate?: Date;
  active?: boolean;
}

export interface ImportEmployeeData {
  employeeId: string;
  name: string;
  nik: string;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
  address?: string;
  hireDate?: string;
}

export interface ImportEmployeeResponse {
  success: boolean;
  message: string;
  imported: number;
  errors: string[];
}
