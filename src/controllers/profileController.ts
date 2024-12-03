import { Request, Response } from 'express';
import physicalUser from '../models/physicalUser';
import legalUser from '../models/legalUser';


export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        let data
        if (req.user.isLegal) {
            data = {
                id: req.user.userLegal._id,
                name: req.user.userLegal.name,
                phone: req.user.userLegal.phone,
                email: req.user.userLegal.email,
                point: req.user.userLegal.point,
                status: req.user.userLegal.status,
                company_name: req.user.userLegal.company_name,
                pnfl: req.user.userLegal.pnfl,
                legal: true
            }
        } else {
            data = {
                id: req.user.userPhysical._id,
                name: req.user.userPhysical.name,
                phone: req.user.userPhysical.phone,
                email: req.user.userPhysical.email,
                point: req.user.userPhysical.point,
                legal: false
            }
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id, updateData } = req.body;
        if (!id || !updateData) {
            res.status(400).json({ message: 'Missing required fields: id, or updateData' });
            return
        }

        let updatedUser;
        
        if (req.user.isLegal) {
            updatedUser = await legalUser.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');
        } else {
            updatedUser = await physicalUser.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');
        }

        if (!updatedUser) {
            res.status(404).json({ message: `User with id ${id} not found.` });
            return
        }

        res.json({ data: updatedUser, error: false, message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

