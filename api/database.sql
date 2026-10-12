-- RideOn database (PostgreSQL). The API also creates these tables automatically.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(64) NOT NULL,          -- SHA-256 of the password
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS wallets (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(10,2) NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,               -- + credit, - debit
  type VARCHAR(10) NOT NULL,                   -- ADD / PAYMENT / REFUND
  note VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS rides (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  detail VARCHAR(200),
  fare NUMERIC(10,2) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT NOW()
);
