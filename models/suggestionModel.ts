import { getDB } from '../config/db.js';

export interface Suggestion {
  id: number;
  task_id: number;
  suggested_date: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  created_at: string;
}

export class SuggestionModel {
  static async getPendingSuggestions(userId: number): Promise<Suggestion[]> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed');
    const [rows] = await db.execute(`
      SELECT r.* FROM reschedule_suggestions r
      JOIN tasks t ON r.task_id = t.id
      JOIN subjects s ON t.subject_id = s.subject_id
      WHERE r.status = "Pending" AND s.user_id = ?
    `, [userId]);
    return rows as Suggestion[];
  }

  static async createSuggestion(taskId: number, suggestedDate: string): Promise<number> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed');
    const [result]: any = await db.execute(
      'INSERT INTO reschedule_suggestions (task_id, suggested_date) VALUES (?, ?)',
      [taskId, suggestedDate]
    );
    return result.insertId;
  }

  static async updateSuggestionStatus(id: number | string, status: 'Accepted' | 'Rejected'): Promise<void> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed');
    await db.execute(
      'UPDATE reschedule_suggestions SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  static async getSuggestionByTaskId(taskId: number): Promise<Suggestion | null> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed');
    const [rows]: any = await db.execute(
      'SELECT * FROM reschedule_suggestions WHERE task_id = ? ORDER BY id DESC LIMIT 1',
      [taskId]
    );
    return rows[0] || null;
  }

  static async getSuggestionById(id: number | string): Promise<Suggestion | null> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed');
    const [rows]: any = await db.execute(
      'SELECT * FROM reschedule_suggestions WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }
}
