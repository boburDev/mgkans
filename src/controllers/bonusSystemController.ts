import { Request, Response } from 'express';
import BonusSystem, { BonusSystemPictureModel } from '../models/bonusSystem';

export const createBonusSystem = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || !files.length) {
            res.status(400).json({ error: "No files were uploaded." });
            return
        }
        const newPath = files[0].destination.split('./public')[1] + '/' + files[0].filename

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

        const bonusSystem = await bonusEntry.save();

        for (const file of files) {
            const newPicture = new BonusSystemPictureModel({
                bonusSystemId: bonusSystem._id,
                path: `${file.destination.split('./public')[1]}/${file.filename}`,
            });
            await newPicture.save();
        }

        res.status(201).json({ message: 'Created successfully', data: bonusSystem });
    } catch (error) {
        console.error('Error creating bonus system entry:', error);
        res.status(500).json({ message: 'Error creating bonus system entry', error });
    }
};

export const getAllBonusSystems = async (req: Request, res: Response): Promise<void> => {
    try {

        
        const status = req.query.status;
        
        if (typeof status != 'boolean') {
            res.status(400).json({ error: "Status not found." });
            return
        }
        const matchQuery = status
            ? { legalId: { $exists: true, $ne: null } }
            : { physicalId: { $exists: true, $ne: null } };
       
        const bonusEntries = await BonusSystem.aggregate([
            {
                $match: matchQuery, 
            },
            {
                $lookup: {
                    from: 'bonussystempictures', 
                    localField: '_id',            
                    foreignField: 'bonusSystemId',
                    as: 'pictures',               
                },
            },
            {
                $project: {
                    path: 1,
                    userName: 1,
                    time: 1,
                    pictures: 1,
                },
            },
        ]);
        res.status(200).json({ message: 'Bonus system entries fetched successfully', data: bonusEntries });
    } catch (error) {
        console.error('Error fetching bonus system entries:', error);
        res.status(500).json({ message: 'Error fetching bonus system entries', error });
    }
};

export const getBonusSystemByToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const isLegal = req.user.isLegal;
        let query = isLegal ? { legalId: req.user.userLegal?._id } : { physicalId: req.user.userPhysical?._id }
        const bonusEntry = await BonusSystem.aggregate([
            {
                $match: query,
            },
            {
                $lookup: {
                    from: 'bonussystempictures',
                    localField: '_id',
                    foreignField: 'bonusSystemId',
                    as: 'pictures',
                },
            },
            {
                $project: {
                    path: 1,
                    userName: 1,
                    time: 1,
                    pictures: 1,
                },
            },
        ]);
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