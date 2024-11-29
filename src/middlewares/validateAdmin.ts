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
        console.log(req.headers)
        
        let decoded: Admin | null = verifyAdmin(String(token));
        console.log(decoded);
        if (!decoded) throw new Error("Invalid token!");
        
        const user = await User.findById(decoded.id);
        console.log(user)
        
        if (!user) throw new Error('Admin not found!');

        req.admin = decoded
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