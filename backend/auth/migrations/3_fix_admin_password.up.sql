-- Update the admin user with a proper bcrypt hash for password "admin123"
UPDATE users 
SET password_hash = '$2b$10$K8BEaPAXn8LzqO2jlCfHUeQkjnyDxQduoydXxGlvAnyRXHfaQvzu2'
WHERE username = 'admin';
