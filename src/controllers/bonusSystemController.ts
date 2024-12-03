import { Request, Response } from 'express';
import BonusSystem from '../models/bonusSystem';

export const createBonusSystem = async (req: Request, res: Response): Promise<void> => {
    try {

        if (!req.file) throw new Error('File is failed')
        let file = req.file
        const newPath = file.destination.split('./public')[1] + '/' + file.filename

        const { path, legalId, physicalId } = req.body;
        const isLegal = req.user.isLegal;
        const userName = isLegal
            ? req.user.userLegal?.name
            : req.user.userPhysical?.name;

        const bonusEntry = new BonusSystem({
            path: newPath,
            legalId,
            physicalId
        });

        await bonusEntry.save();
        res.status(201).json({ message: 'Created successfully', data: bonusEntry });
    } catch (error) {
        console.error('Error creating bonus system entry:', error);
        res.status(500).json({ message: 'Error creating bonus system entry', error });
    }
};