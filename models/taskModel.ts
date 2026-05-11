import { getDB } from '../config/db.js';

export interface Task {
  id: number;
  title: string;
  description: string;
  deadline: string;
  category: string;
  estimated_effort: number;
  category_weight?: number;
  priority_score?: number;
  created_at?: string;
  subject_id?: number;
}

export class TaskModel {
  static async getAll(userId: number): Promise<Task[]> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed. Check your config.');
    const [rows] = await db.execute(`
      SELECT t.* FROM tasks t
      JOIN subjects s ON t.subject_id = s.subject_id
      WHERE s.user_id = ?
      ORDER BY t.deadline ASC
    `, [userId]);
    return rows as Task[];
  }

  static async getById(id: string | number): Promise<Task | null> {
    const db = await getDB();
    if (!db) throw new Error('Database connection failed');
    const [rows]: any = await db.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(taskData: Omit<Task, 'id'>): Promise<number> {
    const { title, description, deadline, category, estimated_effort, subject_id } = taskData as any;
    const db = await getDB();
    if (!db) throw new Error('Database connection not available');
    
    const subId = subject_id && subject_id !== '' ? parseInt(subject_id) : null;

    const [result]: any = await db.execute(
      'INSERT INTO tasks (title, description, deadline, category, estimated_effort, subject_id) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, deadline, category, estimated_effort, subId]
    );
    return result.insertId;
  }

  static async update(id: string | number, taskData: Partial<Task>): Promise<boolean> {
    const { title, description, deadline, category, estimated_effort, subject_id } = taskData as any;
    const db = await getDB();
    if (!db) throw new Error('Database connection not available');
    
    const subId = subject_id && subject_id !== '' ? parseInt(subject_id) : null;

    await db.execute(
      'UPDATE tasks SET title = ?, description = ?, deadline = ?, category = ?, estimated_effort = ?, subject_id = ? WHERE id = ?',
      [title, description, deadline, category, estimated_effort, subId, id]
    );
    return true;
  }

  static async delete(id: string | number): Promise<boolean> {
    const db = await getDB();
    if (!db) throw new Error('Database connection not available');
    
    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
    return true;
  }

  static async detectClashes(userId: number): Promise<any[]> {
    const db = await getDB();
    if (!db) throw new Error('Database connection not available');
    
    const [rows] = await db.execute(`
      SELECT 
        a.id as task1_id, a.title as task1_title, a.deadline as task1_deadline,
        b.id as task2_id, b.title as task2_title, b.deadline as task2_deadline
      FROM tasks a
      JOIN tasks b ON a.id < b.id
      JOIN subjects sa ON a.subject_id = sa.subject_id
      JOIN subjects sb ON b.subject_id = sb.subject_id
      WHERE ABS(TIMESTAMPDIFF(SECOND, a.deadline, b.deadline)) < 86400
        AND sa.user_id = ?
        AND sb.user_id = ?
      ORDER BY a.deadline ASC
    `, [userId, userId]);
    
    const clashes = rows as any[];

    // Import here to avoid circular dependency issues if any
    const { SuggestionModel } = await import('./suggestionModel.js');
    const allTasks = await this.getAll(userId);

    for (const clash of clashes) {
      const task1 = allTasks.find(t => t.id === clash.task1_id);
      const task2 = allTasks.find(t => t.id === clash.task2_id);
      
      if (!task1 || !task2) continue;

      const p1 = task1.priority_score || 0;
      const p2 = task2.priority_score || 0;

      let taskToReschedule = task2;
      if (p1 < p2) {
        taskToReschedule = task1;
      } else if (p1 === p2) {
        if (new Date(task1.deadline) > new Date(task2.deadline)) {
          taskToReschedule = task1;
        }
      }

      // Check if it already has a pending or rejected suggestion
      const existing = await SuggestionModel.getSuggestionByTaskId(taskToReschedule.id);
      if (!existing || existing.status === 'Accepted') {
        let proposedDate = new Date(taskToReschedule.deadline);
        let found = false;
        
        while (!found) {
          proposedDate.setDate(proposedDate.getDate() + 1);
          
          let hasClash = false;
          for (const t of allTasks) {
            if (t.id === taskToReschedule.id) continue;
            
            const tDate = new Date(t.deadline);
            const diffHours = Math.abs(tDate.getTime() - proposedDate.getTime()) / (1000 * 60 * 60);
            
            if (diffHours < 24) {
              hasClash = true;
              break;
            }
          }
          
          if (!hasClash) {
            found = true;
          }
        }
        
        const formattedDate = proposedDate.toISOString().slice(0, 19).replace('T', ' ');
        await SuggestionModel.createSuggestion(taskToReschedule.id, formattedDate);
      }
    }
    
    return clashes;
  }
}
