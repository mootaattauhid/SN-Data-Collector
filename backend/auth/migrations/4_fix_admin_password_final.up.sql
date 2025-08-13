-- Update the admin user with a correct bcrypt hash for password "admin123"
-- This hash was generated with bcrypt.hash('admin123', 10)
UPDATE users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'admin';
