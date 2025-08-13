ALTER TABLE machine_data 
RENAME COLUMN machine_id TO employee_id;

ALTER TABLE machine_data 
RENAME COLUMN col3 TO work_code;

ALTER TABLE machine_data 
RENAME COLUMN col4 TO verification;

ALTER TABLE machine_data 
RENAME COLUMN col5 TO state;

COMMENT ON COLUMN machine_data.employee_id IS 'Employee ID';
COMMENT ON COLUMN machine_data.work_code IS 'Work code';
COMMENT ON COLUMN machine_data.verification IS 'Verification status';
COMMENT ON COLUMN machine_data.state IS 'State';
