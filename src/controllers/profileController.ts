import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import LegalUser from '../models/legal-user';
import PhysicalUser from '../models/physical-user';

import { generateToken } from '../utils/jwt';

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        let data
        if (req.user.isLegal) {
            data = {
                name: req.user.userLegal.name,
                phone: req.user.userLegal.phone,
                email: req.user.userLegal.email,
                score: req.user.userLegal.point,
                status: req.user.userLegal.status,
                company_name: req.user.userLegal.company_name,
                pnfl: req.user.userLegal.pnfl
            }
        } else {
            data = {
                name: req.user.userPhysical.name,
                phone: req.user.userPhysical.phone,
                email: req.user.userPhysical.email,
                score: req.user.userPhysical.point
            }
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error });
    }
};

// Get current user
export const getCurrentUserP = async (req: Request, res: Response) => {
    try {
        const user = await PhysicalUser.findById(req.user._id).select('-password');
        if (!user) res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error });
    }
};