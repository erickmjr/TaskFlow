import {Request, Response} from 'express';
import { PrismaClient } from "../../generated/prisma/client";
import { Pool } from "pg";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const registerUser = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!password || password.length < 8) {
        return res.status(400).json({
            message: 'Password must have at least 8 digits.'
        });
    }

    try {

        const emailExists = await prisma.user.findUnique({
            where: { email }
        });

        if (emailExists) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const created = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
                createdAt: new Date()
            }
        });

        const token = jwt.sign(
            {
                id: Number(created.id),
                email: created.email
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: '2h'
            }
        );

        res.status(201).json({ token, created });

    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Server error' });
    }
}

export const loginUser =async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            {
                id: Number(user.id),
                email: user.email
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: '2h'
            }
        );

        return res.status(200).json({
            token,
            user: {
                id: Number(user.id),
                email: user.email,
                name: user.name
            }
        })

    } catch (error) {
        res.status(500).json({ error: 'Server error.' })
    }
}