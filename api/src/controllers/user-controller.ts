import { Request, Response } from 'express';
import * as UsersServices from '../services/users-services';

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const response = await UsersServices.registerUser(email, password, name);

        res.status(response.status).json(response.body);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const response = await UsersServices.loginUser(email, password);

        res.status(response.status).json(response.body);

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteUserById = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        const response = await UsersServices.deleteUserById(userId);

        res.status(response.status).json(response.body);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }

};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ error: 'Email is required.' });

        const response = await UsersServices.forgotPassword(email);

        if (!response) return res.status(500).json({ message: 'Internal server error' });

        res.status(response.status).json(response.body);

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    };
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required.'});

        const response = await UsersServices.resetPassword(token, newPassword);

        res.status(response.status).json(response.body);

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.' });
    }
}