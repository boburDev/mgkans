import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import LegalUser from '../models/legal-user';
import { generateToken } from '../utils/jwt';


// Register a new user
export const registerUser = async (req: Request, res: Response) => {
    const { name, email, phone, password, company_name, pnfl } = req.body;

    try {

        let user
        if (email) {
            user = await LegalUser.findOne({ email });
        } else {
            user = await LegalUser.findOne({ phone });
        }

        if (user) {
            res.status(400).json({ message: `This ${email ? 'email' : 'phone'} already registered` });
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new LegalUser({ name, email, phone, password: hashedPassword, company_name, pnfl });
        await newUser.save();
        const token = generateToken(String(newUser._id), true);
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
    const { email, phone, password } = req.body;

    try {
        const user = await LegalUser.findOne({ $or: [{ email }, { phone }] });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(400).json({ message: `Invalid ${email ? 'email' : 'phone'} or password` });
            return
        }
        const token = generateToken(String(user._id), true);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
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