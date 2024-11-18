import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import LegalUser from '../models/legal-user';
import PhysicalUser from '../models/physical-user';

import { generateToken } from '../utils/jwt';

// Get current user
export const getCurrentUserL = async (req: Request, res: Response) => {
    try {
        const user = await LegalUser.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
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