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
        let newUsers = users.map((user:any) => {
            let newUser = {
                id: user._id,
                name: user.name,
                phone: user.phone,
                status: user.status,
                point: user.point,
                company_name: user.company_name,
                pnfl: user.pnfl,
                email: user.email,
                conterAgentId: userLegal.conterAgentId
            }
            if (user.status == 1) {
                newUser.status = 'request';
            } else if (user.status == 2) {
                newUser.status = 'active';
            } else if (user.status == 3) {
                newUser.status = 'inactive';
            }
            return newUser;
        });
        res.status(200).json({ message: 'Legal users fetched successfully', data: newUsers });
    } catch (error) {
        console.error('Error fetching legal users by status:', error);
        res.status(500).json({ message: 'An error occurred while fetching legal users', error });
    }
};


export const getLegalsUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const userLegal = await legalUser.findById(userId).select('-password');
        if (!userLegal) throw new Error('User not found!');

        let data = {
            id: userLegal._id,
            name: userLegal.name,
            phone: userLegal.phone,
            email: userLegal.email,
            point: userLegal.point,
            status: userLegal.status,
            company_name: userLegal.company_name,
            pnfl: userLegal.pnfl,
            conterAgentId: userLegal.conterAgentId
        }
        
        res.status(200).json({ message: 'Legal users fetched successfully', data: data });
    } catch (error) {
        console.error('Error fetching legal users by status:', error);
        res.status(500).json({ message: 'An error occurred while fetching legal users', error });
    }
};

export const updateLegalUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, userId, conterAgentId } = req.body;

        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }

        if (!conterAgentId) {
            res.status(400).json({ message: 'conterAgentId is required' });
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
            { status: statusNumber, conterAgentId: conterAgentId },
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