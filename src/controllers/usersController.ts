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
            users = await physicalUser.find().select('-password');
        } else if (status === 'legal') {
            users = await legalUser.find().select('-password');
        }

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving users' });
    }
};

export const getLegalsByStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.params;

        if (!status) {
            res.status(400).json({ message: 'Status is required' });
            return;
        }

        const statusNumber = status === 'request' ? 1 : status === 'active' ? 2 : status === 'inactive' ? 3 : 4;
        if (![1, 2, 3, 4].includes(statusNumber)) {
            res.status(400).json({ message: 'Invalid status value. Valid values are 1, 2, 3 or 4.' });
            return;
        }
        let users
        if (statusNumber == 4) {
            users = await legalUser.find();
        } else {
            users = await legalUser.find({ status: statusNumber });
        }

        res.status(200).json({ message: 'Users fetched successfully', data: users });
    } catch (error) {
        console.error('Error fetching users by status:', error);
        res.status(500).json({ message: 'An error occurred while fetching users', error });
    }
};