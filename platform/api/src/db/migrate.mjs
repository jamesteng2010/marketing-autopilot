import { getPool } from './pool.mjs';

const USER_COLUMNS = `
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NULL,
  status ENUM('pending','active') NOT NULL DEFAULT 'pending',
  email_verified_at TIMESTAMP NULL,
  verification_token_hash CHAR(64) NULL,
  verification_token_expires_at TIMESTAMP NULL,
  password_reset_token_hash CHAR(64) NULL,
  password_reset_expires_at TIMESTAMP NULL,
  notifications_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_verification (verification_token_hash),
  KEY idx_users_reset (password_reset_token_hash)
`;

async function columnExists(pool, table, column) {
  const [rows] = await pool.query(
    `SELECT 1 FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`,
    [table, column],
  );
  return rows.length > 0;
}

export async function migrate() {
  const pool = getPool();
  const [tables] = await pool.query(
    `SELECT 1 FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' LIMIT 1`,
  );

  if (!tables.length) {
    await pool.query(`CREATE TABLE users (${USER_COLUMNS}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  } else {
    const alters = [
      ['status', "ADD COLUMN status ENUM('pending','active') NOT NULL DEFAULT 'pending' AFTER display_name"],
      ['email_verified_at', 'ADD COLUMN email_verified_at TIMESTAMP NULL AFTER status'],
      ['verification_token_hash', 'ADD COLUMN verification_token_hash CHAR(64) NULL AFTER email_verified_at'],
      ['verification_token_expires_at', 'ADD COLUMN verification_token_expires_at TIMESTAMP NULL AFTER verification_token_hash'],
      ['password_reset_token_hash', 'ADD COLUMN password_reset_token_hash CHAR(64) NULL AFTER verification_token_expires_at'],
      ['password_reset_expires_at', 'ADD COLUMN password_reset_expires_at TIMESTAMP NULL AFTER password_reset_token_hash'],
      ['verification_email_sent_at', 'ADD COLUMN verification_email_sent_at TIMESTAMP NULL AFTER verification_token_expires_at'],
    ];

    for (const [col, sql] of alters) {
      if (!(await columnExists(pool, 'users', col))) {
        await pool.query(`ALTER TABLE users ${sql}`);
      }
    }

    await pool.query(
      `UPDATE users SET status = 'active', email_verified_at = COALESCE(email_verified_at, created_at)
       WHERE status = 'pending' AND email_verified_at IS NULL
         AND verification_token_hash IS NULL AND created_at < NOW() - INTERVAL 1 MINUTE`,
    );
  }

  const [projectTables] = await pool.query(
    `SELECT 1 FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects' LIMIT 1`,
  );

  if (!projectTables.length) {
    await pool.query(`
      CREATE TABLE projects (
        project_id VARCHAR(32) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status ENUM('active','archived') NOT NULL DEFAULT 'active',
        workspace_uri VARCHAR(512) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_projects_user (user_id),
        CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }
}
