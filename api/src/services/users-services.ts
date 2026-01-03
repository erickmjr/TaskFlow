import * as UsersRepository from '../repository/users-repository';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sendResetPasswordMail } from '../utils/sendResetPasswordMail';

export const getAllUsers = async () => {
    try {
        const users = UsersRepository.getAllUsers();

        if (!users) return { status: 204, body: { message: 'No users.' } };

        return { status: 200, body: users };

    } catch (error) {
        return { status: 500, body: { message: 'Internal server error.' } }
    }
}

export const registerUser = async (email: string, password: string, name: string) => {

    if (!password || password.length < 8) {
        return { status: 400, body: { message: 'Password must have at least 8 digits.' } };
    }

    try {

        const emailExists = await UsersRepository.getUserByEmail(email);

        if (emailExists) {
            return { status: 409, body: { message: 'Email already in use.' } };
        }

        const saltRounds = Number(process.env.BCRYPT_SALT ?? 10);

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const created = await UsersRepository.createUser(name, email, hashedPassword);

        const token = jwt.sign(
            {
                sub: String(created.id),
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
        return { status: 500, body: { error: 'Internal server error' } };
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
        const user = await UsersRepository.deleteUserById(userId);

        return { status: 200, body: { message: 'User deleted', user } };

    } catch (error) {
        return { status: 500, body: { error: 'Internal server error.' } };
    };
};

export const forgotPassword = async (email: string) => {

    try {
        const user = await UsersRepository.getUserByEmail(email);

        if (user) {
            const tokenPassword = jwt.sign(
                {
                    sub: String(user.id),
                    email: email,
                    purpose: 'password-reset'
                },
                process.env.JWT_SECRET!,
                {
                    expiresIn: '15m'
                }
            )
    
            await sendResetPasswordMail(email, tokenPassword);
        }

        return { status: 200, body: { message: 'If the user exists, an e-mail was sent.' } };

    } catch (error) {
        return { status: 500, body: { error: 'Internal server error.' } };
    };
};

export const resetPassword = async (token: string, password: string) => {

    let decoded: ResetPasswordTokenPayload;

    try {
        
        if (!token) return { status: 400, body: { message: 'Missing token.' } };

        const secret: Secret | undefined = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET is not defined");

        decoded = jwt.verify(token, secret) as ResetPasswordTokenPayload;

        if (decoded.purpose !== 'password-reset') {
            return { status: 400, body: { message: 'Invalid token purpose.' } };
        }

        const user = await UsersRepository.getUserById(Number(decoded.sub));

        if (!user) {
            return { status: 404, body: { message: 'User not found.' } };
        };

        if (!password || password.length < 8) {
            return { status: 400, body: { message: 'Password must have at least 8 characters.' } };
        }

        const saltRounds = Number(process.env.BCRYPT_SALT ?? 10);

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userId = Number(decoded.sub);

        if (Number.isNaN(userId)) {
            return { status: 400, body: { message: 'Invalid token subject.' } };
        }

        await UsersRepository.changeUserPassword(userId, hashedPassword);

        return { status: 200 };

    } catch (error) {

        if (error instanceof jwt.TokenExpiredError) {
            return { status: 401, body: { message:  'Token expired' } };
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return { status: 401, body: { message: 'Invalid Token' } };
        }

        return { status: 500, body: { error: 'Internal server error.' } };
    }
}