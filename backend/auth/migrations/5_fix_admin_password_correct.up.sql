-- Update the admin user with the correct bcrypt hash for password "admin123"
-- This hash was properly generated with bcrypt.hash('admin123', 10)
UPDATE users 
SET password_hash = '$2b$10$lvgysdOzlxN.ERTuvb7jHuop2eEPHZ2DlOUWmc7ruIlu3YOcl9eCy'
WHERE username = 'admin';
