CREATE TABLE employees (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  employee_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  nik VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(255),
  position VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(255),
  address TEXT,
  hire_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_nik ON employees(nik);
CREATE INDEX idx_employees_name ON employees(name);
