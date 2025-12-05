import { Request, Response } from 'express';
import { PrismaClient } from "../../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from '@prisma/adapter-pg';
import * as TasksServices from '../services/tasks-services'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const getTasks = async (req: Request, res: Response) => {

    const userId = Number(req.user?.id);

    const response = await TasksServices.getAllTasks(userId);

    res.status(response.status).json(response.body);
}

export const postTask = async (req: Request, res: Response) => {
    const userId = Number(req.user?.id);

    const { title, description, rawDueDate } = req.body;

    const response = await TasksServices.createTask(userId, title, description, rawDueDate);

    res.status(response.status).json(response.body);
}

export const putTask = async (req: Request, res: Response) => {
    const taskId = Number(req.body.id);
    const userId = Number(req.user?.id);

    const { title, description, dueDate, done } = req.body;

    const response = await TasksServices.updateFullTask(taskId, userId, title, description, done, dueDate);

    return res.status(response.status).json(response.body);
}

export const patchTask = async (req: Request, res: Response) => {
    const taskId = Number(req.params.id);
    const userId = Number(req.user?.id);

    const allowedFields = ['title', 'description', 'dueDate', 'done'];

    const dataToUpdate: Record<string, any> = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            dataToUpdate[field] = req.body[field];
        };
    };

    const response = await TasksServices.updateTaskPiece(taskId, userId, dataToUpdate);

    return res.status(response.status).json(response.body);
}

export const deleteTask = async (req: Request, res: Response) => {
    try {

        const taskId = Number(req.params.id);
        const userId = Number(req.user?.id);

        const existingTask = await prisma.task.findFirst({
            where: { id: taskId }
        });

        if (!existingTask) return res.status(404).json({ error: 'Task not found.' });


        const deletedTask = await prisma.task.delete({
            where: {
                id: taskId,
                userId
            }
        });

        return res.status(200).json(deletedTask);

    } catch (error) {
    }
}