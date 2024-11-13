import { NextFunction, Request, Response } from 'express'
import { verify } from '../utils/jwt';
import legalUser, { LUser } from '../models/legal-user';
import physicalUser, { PUser } from '../models/physical-user';
import User from '../types/user';

declare module 'express-serve-static-core' {
    interface Request {
        user: LUser | PUser;
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        let decoded: User | null = verify(String(token));
        console.log(decoded);
        
        if (!decoded) throw new Error("Invalid token!");

        if (decoded.isLegal) {
            const userLegal = await legalUser.findById(decoded.id);
            if (!userLegal) throw new Error('User not found!');
            req.user = userLegal
        } else {
            const userPhysical = await physicalUser.findById(decoded.id);
            if (!userPhysical) throw new Error('User not found!');
            req.user = userPhysical
        }
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token not verified!', error: true });
    }
};

// export const validateAdmin = (req: Request, res: Response, next: NextFunction) => {
//     if (req.user?.role !== 'admin') {
//         return res.status(403).json({ message: 'Access Denied: Admins Only' });
//     }
//     next();
// };