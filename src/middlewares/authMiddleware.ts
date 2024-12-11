import { NextFunction, Request, Response } from 'express'
import { verify } from '../utils/jwt';
import legalUser, { LUser } from '../models/legalUser';
import physicalUser, { PUser } from '../models/physicalUser';
import User from '../types/user';

declare module 'express-serve-static-core' {
    interface Request {
        user: any;
    }
}

const secretKey = process.env.SECRET_KEY
console.log(secretKey);



export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        let decoded: User | null = verify(String(token));
        
        if (!decoded) throw new Error("Invalid token!");

        if (decoded.isLegal) {
            const userLegal = await legalUser.findById(decoded.id).select('-password');
            if (!userLegal) throw new Error('User not found!');
            req.user = {
                isLegal: decoded.isLegal,
                userLegal
            }
        } else {
            const userPhysical = await physicalUser.findById(decoded.id).select('-password');
            if (!userPhysical) throw new Error('User not found!');
            req.user = {
                isLegal: decoded.isLegal,
                userPhysical
            }
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