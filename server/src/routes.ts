import { PrismaClient } from '@prisma/client/extension';
import { Router } from 'express';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth-middleware';
import { describe } from 'node:test';
export const router = Router();

const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const created = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                createdAt: new Date()
            }
        });

        if (!created) {
            res.status(400).json({ error: 'Client error.' });
        }

        const token = jwt.sign(
            {
                id: created.id,
                email: created.email
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: '2h'
            }
        );

        res.status(201).json(
            {
                message: 'User successfully signed up.',
                token
            }
        );
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }

});

router.post('/login', async (req: Request, res: Response) => {
    const { email, hashedPassword } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(user.password, hashedPassword);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: '2h'
            }
        );

        return res.status(200).json({
            message: 'Login successful',
            token
        })

    } catch (error) {
        res.status(500).json({ error: 'Server error.' })
    }
});

router.get('/tasks', authMiddleware, async (req: Request, res: Response) => {

    try {

        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const tasks = await prisma.task.findMany({
            where: { userId }
        });

        if (tasks.length === 0) return res.status(204);

        return res.status(200).json(
            {
                tasks,
                total: tasks.length
            }
        );

    } catch (error) {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.post('/tasks', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const dataToCreate = req.body;

        const allowedFields = ['title', 'description', 'dueDate'];

        const { title, description, dueDate } = req.body;

        if (!title || !description || !dueDate) {
            return res.status(400).json({ error: 'POST requires: title, description and DueDate' });
        }

        const now = new Date();

        const createdTask = await prisma.task.create({
            data: {
                title,
                description,
                dueDate,
                createdAt: now,
                updatedAt: now,
                userId,
                done: false
            }
        });

        res.status(201).json(createdTask);

    } catch (error) {
        return res.status(500).json({ error: 'Server error.' });
    };
});

router.put('/tasks/:id', authMiddleware, async (req: Request, res: Response) => {

    try {
        const taskId = req.params.id;
        const userId = req.user?.id;
        const { title, description, dueDate, done } = req.body;

        if (!title || !description || dueDate === undefined || done === undefined) {
            return res.status(400).json({ error: 'PUT requires full task data.' });
        };

        const existingTask = await prisma.task.findUnique({
            where: {
                id: taskId,
                userId
            },
        });

        if (!existingTask) return res.status(404).json({ error: 'Task not found.' });

        const taskUpdated = await prisma.task.update({
            where: { id: taskId },
            data: {
                title,
                description,
                dueDate,
                done,
                updatedAt: new Date(),
            }
        });


        return res.status(200).json(taskUpdated);

    } catch (error) {
        return res.status(500).json({ error: 'Server error.' });
    };

});

router.patch('/tasks/:id', authMiddleware, async (req: Request, res: Response) => {
    try {

        const taskId = req.params.id;
        const userId = req.user?.id;

        const allowedFields = ['title', 'description', 'dueDate', 'done'];

        const dataToUpdate: Record<string, any> = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                dataToUpdate[field] = req.body[field];
            };
        };

        if (Object.keys(dataToUpdate).length === 0) return res.status(400).json({ error: 'No valid fields to update.' });

        const existingTask = await prisma.task.findFirst({
            where: { id: taskId, userId }
        });

        if (!existingTask) return res.status(404).json({ error: 'Task not found.' });

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                dataToUpdate,
                updatedAt: new Date()
            }
        });

        return res.status(200).json(updatedTask);

    } catch (error) {
        return res.status(500).json({ error: 'Server error.' });
    };
});


router.delete('/tasks/:id', authMiddleware, async (req: Request, res: Response) => {
    try {

        const taskId = req.params.id;
        const userId = req.user?.id;

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
})

export default router;