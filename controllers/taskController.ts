import { Request, Response } from 'express';
import { TaskModel } from '../models/taskModel.js';

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const tasks = await TaskModel.getAll(userId);
    res.json(tasks);
  } catch (error: any) {
    res.status(503).json({ 
      message: 'Database connection failed. Please ensure your MySQL server is running.',
      error: error.message 
    });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const taskId = await TaskModel.create(req.body);
    const newTask = await TaskModel.getById(taskId);
    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    await TaskModel.update(req.params.id, req.body);
    const updatedTask = await TaskModel.getById(req.params.id);
    res.json(updatedTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    await TaskModel.delete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import { AlertModel } from '../models/alertModel.js';

export const getClashes = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const clashes = await TaskModel.detectClashes(userId);
    
    // Log detected clashes to the database table for the DBMS project
    for (const clash of clashes) {
      await AlertModel.log(
        clash.task1_id, 
        clash.task2_id, 
        `Collision detected between "${clash.task1_title}" and "${clash.task2_title}"`
      );
    }

    res.json(clashes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
