import * as UsersRepository from '../repository/users-repository';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sendResetPasswordMail } from '../utils/sendResetPasswordMail';

export const registerUser = async (email: string, password: string, name: string) => {

    if (!password || password.length < 8) {
        return { status: 400, body: { message: 'Password must have at least 8 digits.' } };
    }

    try {

        const emailExists = await UsersRepository.getUserByEmail(email);

        if (emailExists) {
            return { status: 409, body: { message: 'Email already in use.' } };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const created = await UsersRepository.createUser(name, email, hashedPassword);

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

        return { status: 201, body: { token, created } };

    } catch (error) {
        console.error(error)
        return { status: 500, body: { error: 'Server error' } };
    };
};

export const loginUser = async (email: string, password: string) => {
    try {
        const user = await UsersRepository.getUserByEmail(email);

        if (!user) {
            return { status: 4011, body: { error: 'Invalid credentials.' } };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return { status: 401, body: { error: 'Invalid credentials.' } };
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

        return {
            status: 200, body: {
                token,
                user: {
                    id: Number(user.id),
                    email: user.email,
                    name: user.name
                }
            }
        };

    } catch (error) {
        return { status: 500, body: { error: 'Internal server error.' } };
    };
};

export const deleteUserById = async (userId: number) => {

    try {
        const user = UsersRepository.deleteUserById(userId);

        return { status: 200, body: { message: 'User deleted', user } };

    } catch (error) {
        return { status: 500, body: { error: 'Internal server error.' } };
    };
};

export const forgotPassword = async (email: string) => {

    try {
        const user = UsersRepository.getUserByEmail(email);

        if (!user) {
            return { status: 204, body: { error: 'User does not exist.' } };
        }

        const tokenPassword = jwt.sign(
            {
                email: user.email,
                purpose: 'password-reset'
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: '10m'
            }
        )

        await sendResetPasswordMail(email, tokenPassword);

        return { status: 200, body: { tokenPassword, message: 'E-mail sent.' } };

    } catch (error) {
        return { status: 500, body: { error: 'Internal server error.' } };
    };
};

export const resetPassword = async (email: string, password: string) => {

    try {

        const user = await UsersRepository.getUserByEmail(email);

        if (!user) {
            return { status: 204, body: { error: 'Internal error.' } };
        };

        if (!password || password.length < 8) {
            return { status: 400, body: { message: 'Password must have at least 8 digits.' } };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await UsersRepository.changeUserPassword(email, hashedPassword);

        return { status: 200, body: { message: 'Password updated', updatedUser } };

    } catch (error) {
        return { status: 500, body: { error: 'Internal server error.' } }
    }

}