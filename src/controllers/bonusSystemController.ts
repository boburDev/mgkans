import { Request, Response } from 'express';
import BonusSystem from '../models/bonusSystem';

export const createBonusSystem = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) throw new Error('File is failed')
        let file = req.file
        const newPath = file.destination.split('./public')[1] + '/' + file.filename

        const isLegal = req.user.isLegal;
        const userName = isLegal
            ? req.user.userLegal?.name
            : req.user.userPhysical?.name;

        const bonusEntry = new BonusSystem({
            path: newPath,
            legalId: isLegal ? req.user.userLegal?._id : null,
            physicalId: isLegal ? null : req.user.userPhysical?._id,
            userName
        });

        await bonusEntry.save();
        res.status(201).json({ message: 'Created successfully', data: bonusEntry });
    } catch (error) {
        console.error('Error creating bonus system entry:', error);
        res.status(500).json({ message: 'Error creating bonus system entry', error });
    }
};

export const getAllBonusSystems = async (_req: Request, res: Response): Promise<void> => {
    try {
        const bonusEntries = await BonusSystem.find()
            .populate('legalId')
            .populate('physicalId');

        res.status(200).json({ message: 'Bonus system entries fetched successfully', data: bonusEntries });
    } catch (error) {
        console.error('Error fetching bonus system entries:', error);
        res.status(500).json({ message: 'Error fetching bonus system entries', error });
    }
};

export const getBonusSystemById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const bonusEntry = await BonusSystem.findById(id)
            .populate('legalId')
            .populate('physicalId');

        if (!bonusEntry) {
            res.status(404).json({ message: 'Bonus system entry not found' });
            return;
        }

        res.status(200).json({ message: 'Bonus system entry fetched successfully', data: bonusEntry });
    } catch (error) {
        console.error('Error fetching bonus system entry:', error);
        res.status(500).json({ message: 'Error fetching bonus system entry', error });
    }
};

export const deleteBonusSystem = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deletedBonusEntry = await BonusSystem.findByIdAndDelete(id);

        if (!deletedBonusEntry) {
            res.status(404).json({ message: 'Bonus system entry not found' });
            return;
        }

        res.status(200).json({ message: 'Bonus system entry deleted successfully', data: deletedBonusEntry });
    } catch (error) {
        console.error('Error deleting bonus system entry:', error);
        res.status(500).json({ message: 'Error deleting bonus system entry', error });
    }
};