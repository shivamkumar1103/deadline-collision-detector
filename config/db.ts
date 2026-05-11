import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

let pool: mysql.Pool | null = null;

export const getDB = async () => {
  if (!pool) {
    try {
      const dbName = process.env.DB_NAME || "deadline_db";
      const baseConfig = {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
      };

      // Connect without database to create it if it doesn't exist
      const tempConnection = await mysql.createConnection(baseConfig);
      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      await tempConnection.end();

      const dbConfig = {
        ...baseConfig,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      };

      pool = mysql.createPool(dbConfig);

      // Test the connection immediately
      await pool.getConnection();
      console.log("✅ Successfully connected to MySQL database.");

      // Auto-create tables for first-time setup
      // 1. Users table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 2. Subjects table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS subjects (
          subject_id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          subject_name VARCHAR(100) NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
      `);

      // 3. Tasks table (Updated to include subject_id)
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          subject_id INT,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          deadline DATETIME NOT NULL,
          category VARCHAR(50),
          estimated_effort INT DEFAULT 1,
          category_weight INT GENERATED ALWAYS AS (
            CASE category
              WHEN 'Exam'       THEN 4
              WHEN 'Quiz'       THEN 3
              WHEN 'Project'    THEN 2
              WHEN 'Assignment' THEN 1
              ELSE 1
            END
          ) STORED,
          priority_score INT GENERATED ALWAYS AS (
            CASE category
              WHEN 'Exam'       THEN 4
              WHEN 'Quiz'       THEN 3
              WHEN 'Project'    THEN 2
              WHEN 'Assignment' THEN 1
              ELSE 1
            END * estimated_effort
          ) STORED,
          status VARCHAR(20) DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL
        )
      `);

      // Self-healing: Ensure subject_id exists if the table was created previously
      try {
        await pool.execute(
          "ALTER TABLE tasks ADD COLUMN subject_id INT AFTER id",
        );
        await pool.execute(
          "ALTER TABLE tasks ADD FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL",
        );
      } catch (e) {
        // Column already exists, ignore error
      }
      
      // Self-healing: Add estimated_effort
      try {
        await pool.execute(
          "ALTER TABLE tasks ADD COLUMN estimated_effort INT DEFAULT 1 AFTER category",
        );
      } catch (e) {
        // Column already exists, ignore error
      }

      // Self-healing: Add generated columns
      try {
        await pool.execute(`
          ALTER TABLE tasks 
          ADD COLUMN category_weight INT GENERATED ALWAYS AS (
            CASE category
              WHEN 'Exam'       THEN 4
              WHEN 'Quiz'       THEN 3
              WHEN 'Project'    THEN 2
              WHEN 'Assignment' THEN 1
              ELSE 1
            END
          ) STORED AFTER estimated_effort
        `);
        await pool.execute(`
          ALTER TABLE tasks 
          ADD COLUMN priority_score INT GENERATED ALWAYS AS (
            CASE category
              WHEN 'Exam'       THEN 4
              WHEN 'Quiz'       THEN 3
              WHEN 'Project'    THEN 2
              WHEN 'Assignment' THEN 1
              ELSE 1
            END * estimated_effort
          ) STORED AFTER category_weight
        `);
      } catch (e) {
        // Columns already exist, ignore error
      }

      // 4. Collision Alerts table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS collision_alerts (
          alert_id INT AUTO_INCREMENT PRIMARY KEY,
          task1_id INT,
          task2_id INT,
          message TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task1_id) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (task2_id) REFERENCES tasks(id) ON DELETE CASCADE
        )
      `);

      // 5. Reschedule Suggestions table
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS reschedule_suggestions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          task_id INT NOT NULL,
          suggested_date DATETIME NOT NULL,
          status VARCHAR(20) DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
        )
      `);
    } catch (error: any) {
      console.error("❌ DATABASE CONNECTION ERROR:");
      console.error(`Message: ${error.message}`);
      console.error("--------------------------------------------------");
      pool = null;
    }
  }
  return pool;
};
