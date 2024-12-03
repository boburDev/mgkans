import { Request, Response } from 'express';
import physicalUser from '../models/physicalUser';
import legalUser from '../models/legalUser';

export const getUsersByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.params;

        if (!status) {
            res.status(400).json({ message: 'Status is required' });
            return;
        }

        let users;
        if (status === 'physical') {
            users = await physicalUser.find();
        } else if (status === 'legal') {
            users = await legalUser.find();
        }

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving users' });
    }
};
