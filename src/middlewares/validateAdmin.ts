import { NextFunction, Request, Response } from 'express'
import { verifyAdmin } from '../utils/jwt';
import User, { Admin } from '../models/adminUser';

declare module 'express-serve-static-core' {
    interface Request {
        admin: Admin;
    }
}

export const validateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.token;
    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return
    }

    try {
        let decoded: Admin | null = verifyAdmin(String(token));
        if (!decoded) throw new Error("Invalid token!");

        const user = await User.findById(decoded.id);
        if (!user) throw new Error('Admin not found!');

        req.user = decoded
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token not verified!', error: true });
        return
    }
};

export const validateAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admins Only' });
    }
    next();
};