CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'user')),
  employee_id VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create default super admin user
-- Password: admin123
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ', 'super_admin');

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_employee_id ON users(employee_id);
