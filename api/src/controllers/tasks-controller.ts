import { Request, Response } from 'express';
import * as TasksServices from '../services/tasks-services'

export const getTasks = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);

        const response = await TasksServices.getAllTasks(userId);

        res.status(response.status).json(response.body);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error.' });
    }
};

export const getTaskById = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);
        const taskId = Number(req.params.id);

        if (isNaN(taskId)) return res.status(400).json({ error: 'Invalid task ID.' });

        const response = await TasksServices.getTaskById(taskId, userId);

        return res.status(response.status).json(response.body);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const postTask = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.user?.id);

        if (!req.body) return res.status(400).json({ error: 'Request body is missing.' });

        const { title, description, rawDueDate } = req.body;

        const response = await TasksServices.createTask(userId, title, description, rawDueDate);

        res.status(response.status).json(response.body);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const putTask = async (req: Request, res: Response) => {
    try {

        
        const taskId = Number(req.params.id);
        const userId = Number(req.user?.id);

        if (isNaN(taskId)) return res.status(400).json({ error: 'Invalid task ID.' });

        if (!req.body) return res.status(400).json({ error: 'Request body is missing.' });

        const { title, description, dueDate, done } = req.body;

        const response = await TasksServices.updateFullTask(taskId, userId, title, description, done, dueDate);

        return res.status(response.status).json(response.body);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error.' });
    }
};

export const patchTask = async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.id);
        const userId = Number(req.user?.id);

        if (!req.body) return res.status(400).json({ error: 'Request body is missing.' });

        const allowedFields = ['title', 'description', 'dueDate', 'done'];

        const dataToUpdate: Record<string, any> = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                dataToUpdate[field] = req.body[field];
            };
        };

        const response = await TasksServices.updateTaskPiece(taskId, userId, dataToUpdate);

        return res.status(response.status).json(response.body);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error.' });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const taskId = Number(req.params.id);
        const userId = Number(req.user?.id);

        const existingTask = await TasksServices.getTaskById(taskId, userId);

        if (!existingTask) return res.status(404).json({ error: 'Task not found.' });

        const deletedTask = await TasksServices.deleteTask(taskId, userId);

        return res.status(200).json(deletedTask);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error.' });
    }
}
