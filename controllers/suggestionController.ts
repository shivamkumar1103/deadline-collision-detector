import { Request, Response } from 'express';
import { SuggestionModel } from '../models/suggestionModel.js';
import { TaskModel } from '../models/taskModel.js';

export const getPendingSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const suggestions = await SuggestionModel.getPendingSuggestions(userId);
    res.json(suggestions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptSuggestion = async (req: Request, res: Response) => {
  try {
    const suggestionId = req.params.id;
    const suggestion = await SuggestionModel.getSuggestionById(suggestionId);
    
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    if (suggestion.status !== 'Pending') {
      return res.status(400).json({ message: 'Suggestion already processed' });
    }

    // Update suggestion status
    await SuggestionModel.updateSuggestionStatus(suggestionId, 'Accepted');

    // Update task deadline
    const task = await TaskModel.getById(suggestion.task_id);
    if (task) {
      // Create a formatted datetime string for MySQL (YYYY-MM-DD HH:MM:SS)
      // Extract from ISO format or use as is if valid
      const newDeadline = new Date(suggestion.suggested_date);
      const formattedDate = newDeadline.toISOString().slice(0, 19).replace('T', ' ');
      
      await TaskModel.update(suggestion.task_id, {
        title: task.title,
        description: task.description,
        deadline: formattedDate,
        category: task.category,
        estimated_effort: task.estimated_effort,
        subject_id: (task as any).subject_id
      });
    }

    res.json({ message: 'Suggestion accepted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectSuggestion = async (req: Request, res: Response) => {
  try {
    const suggestionId = req.params.id;
    const suggestion = await SuggestionModel.getSuggestionById(suggestionId);
    
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    if (suggestion.status !== 'Pending') {
      return res.status(400).json({ message: 'Suggestion already processed' });
    }

    await SuggestionModel.updateSuggestionStatus(suggestionId, 'Rejected');
    res.json({ message: 'Suggestion rejected successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
