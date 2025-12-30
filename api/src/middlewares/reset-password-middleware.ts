import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

export const resetPasswordMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.body.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const secret: Secret | undefined = process.env.JWT_SECRET;

        if (!secret) throw new Error("JWT is not defined.");

        const decoded = jwt.verify(token, secret) as JwtPayload;
        
        if (decoded.purpose !== 'password_reset') throw new Error('Invalid token purpose.');

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' })
    }
}