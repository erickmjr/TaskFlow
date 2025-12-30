import { PrismaClient } from "../../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from '@prisma/adapter-pg';
import { TaskModel } from "../models/Task";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const getAllUserTasks = async (userId: number): Promise<TaskModel[]> => {
    const tasks = prisma.task.findMany({
        where: { userId }
    });

    return tasks;
};

export const createTask = async (title: string, description: string, dueDate: Date, userId: number, now: Date): Promise<TaskModel> => {

    const createdTask = await prisma.task.create({
        data: {
            title,
            description,
            dueDate,
            createdAt: now,
            updatedAt: now,
            userId,
            done: false,
        }
    });

    return createdTask;
};

export const updateTask = async (taskId: number, userId: number, data: Partial<TaskModel>) => {
    const updatedTask = prisma.task.update({
        where: { id: taskId, userId: userId },
        data: {
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            done: data.done,
            updatedAt: new Date(),
        }
    });

    return updatedTask;
};


export const deleteTaskById = async (taskId: number, userId: number) => {
    const deletedTask = prisma.task.delete({
        where: { id: taskId, userId: userId }
    });

    return deletedTask;
}

export const getTaskById = async (taskId: number, userId: number) => {
    const existingTask = await prisma.task.findFirst({
        where: {
            id: taskId,
            userId: userId
        },
    });

    return existingTask;
};