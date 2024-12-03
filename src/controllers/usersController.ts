import { Request, Response } from 'express';
import physicalUser from '../models/physicalUser';
import legalUser from '../models/legalUser';

export const getPhysicalUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await physicalUser.find().select('_id name email phone point');
        res.status(200).json({ message: 'Physical users fetched successfully', data: users });
    } catch (error) {
        console.error('Error fetching physical users:', error);
        res.status(500).json({ message: 'An error occurred while retrieving physical users', error });
    }
};

export const getLegalsUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.params;

        if (!status) {
            res.status(400).json({ message: 'Status is required' });
            return;
        }

        const statusMap: Record<string, number> = {
            request: 1,
            active: 2,
            inactive: 3,
            all: 4,
        };

        const statusNumber = statusMap[status];
        if (statusNumber === undefined) {
            res.status(400).json({ message: 'Invalid status value. Valid values are request, active, inactive, or all.' });
            return;
        }

        const query = statusNumber === 4 ? {} : { status: statusNumber };
        let users = await legalUser.find(query).select('_id name email phone point status company_name pnfl');
        users = users.map((user:any) => {
            
            if (user.status == 1) {
                console.log(1, user);
                user.status = 'request';
            } else if (user.status == 2) {
                user.status = 'active';
            } else if (user.status == 3) {
                user.status = 'inactive';
            }
            return user;
        });
        res.status(200).json({ message: 'Legal users fetched successfully', data: users });
    } catch (error) {
        console.error('Error fetching legal users by status:', error);
        res.status(500).json({ message: 'An error occurred while fetching legal users', error });
    }
};

export const updateLegalUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, userId } = req.body;

        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }

        if (status === undefined) {
            res.status(400).json({ message: 'Status is required' });
            return;
        }

        const statusMap: Record<string, number> = {
            active: 2,
            inactive: 3
        };

        const statusNumber = statusMap[status];
        if (statusNumber === undefined) {
            res.status(400).json({ message: 'Invalid status value. Valid values are request, active, inactive, or all.' });
            return;
        }

        const updatedUser = await legalUser.findByIdAndUpdate(
            userId,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ message: 'Status updated successfully', data: updatedUser });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'An error occurred while updating the user status', error });
    }
};