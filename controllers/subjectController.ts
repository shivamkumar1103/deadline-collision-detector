import { Request, Response } from 'express';
import { SubjectModel } from '../models/subjectModel.js';

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const subjects = await SubjectModel.getAll(userId);
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = res.locals.userId;
    const id = await SubjectModel.create(name, userId);
    res.status(201).json({ id, name });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await SubjectModel.delete(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
