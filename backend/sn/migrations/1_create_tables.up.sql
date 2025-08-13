CREATE TABLE sn_list (
  id BIGSERIAL PRIMARY KEY,
  sn VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(255) DEFAULT 'Pending',
  data_count INTEGER DEFAULT 0,
  sheet_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE machine_data (
  id BIGSERIAL PRIMARY KEY,
  sn VARCHAR(255) NOT NULL,
  machine_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  col3 VARCHAR(255),
  col4 VARCHAR(255),
  col5 VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sn, machine_id, timestamp)
);

CREATE INDEX idx_machine_data_sn ON machine_data(sn);
CREATE INDEX idx_machine_data_timestamp ON machine_data(timestamp);
