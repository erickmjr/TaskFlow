import { PrismaClient } from "../../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const getAllUsers = async () => {
    const users = await prisma.user.findMany();

    return users;
}

export const createUser = async (name: string, email: string, hashedPassword: string) => {
    const created = await prisma.user.create({
        data: {
            name: name,
            email: email,
            type: 'common',
            password: hashedPassword,
            createdAt: new Date()
        }
    });

    return created;
};

export const getUserById = async (userId: number) => {
    const user = await prisma.user.findFirst({
        where: { id: userId }
    });

    return user;
};

export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: { email: email }
    });
    
    return user;
}

export const deleteUserById = async (userId: number) => {
    const user = await prisma.user.delete({
        where: { id: userId }
    });

    return user;
};

export const changeUserName = async (userId: number, name: string) => {
    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name: name
        }
    });

    return user;
};

export const changeUserPassword = async (userId: number, password: string) => {
    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            password: password
        }
    });

    return user;
}