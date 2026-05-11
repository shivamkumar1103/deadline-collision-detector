import { getDB } from '../config/db.js';

export interface Subject {
  subject_id: number;
  user_id: number;
  subject_name: string;
}

export class SubjectModel {
  static async getAll(userId: number): Promise<Subject[]> {
    const db = await getDB();
    if (!db) throw new Error('DB Connection Failed');
    const [rows] = await db.execute('SELECT * FROM subjects WHERE user_id = ?', [userId]);
    return rows as Subject[];
  }

  static async create(name: string, userId: number): Promise<number> {
    const db = await getDB();
    if (!db) throw new Error('DB Connection Failed');
    const [result]: any = await db.execute(
      'INSERT INTO subjects (subject_name, user_id) VALUES (?, ?)',
      [name, userId]
    );
    return result.insertId;
  }

  static async delete(id: number | string): Promise<boolean> {
    const db = await getDB();
    if (!db) throw new Error('DB Connection Failed');
    await db.execute('DELETE FROM subjects WHERE subject_id = ?', [id]);
    return true;
  }
}
