import mysql from 'mysql2/promise';
import { getConfig } from '../config.mjs';

let pool;

export function getPool() {
  if (!pool) {
    const { db } = getConfig();
    pool = mysql.createPool({
      host: db.host,
      port: db.port,
      user: db.user,
      password: db.password,
      database: db.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}
