import { Request, Response } from 'express'
import Admin from '../models/adminUser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const secretKey: string = process.env.SECRET_KEY || 'there_is_bad_guy'

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, role = 'user', enter = false } = req.body;
        const user = await Admin.findOne({ email });
        if (user) {
            res.status(400).json({ message: 'User already exists' });
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Admin({ email, password: hashedPassword, role });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id, role: newUser.role }, secretKey!, { expiresIn: '1h' });
        const userPayload = { email: newUser.email, role: newUser.role }
        res.status(201).json({ ...(enter && { token }), user: userPayload, message: 'User registered successfully' });
    } catch (error: unknown) {
        res.status(500).json({ data: null, error: (error as Error).message })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await Admin.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' })
            return
        };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid password' });
            return
        }

        const token = jwt.sign({ id: user._id, role: user.role }, secretKey!, { expiresIn: '1h' });
        const userPayload = { email: user.email, role: user.role }

        res.json({ token, user: userPayload });
    } catch (error: unknown) {
        res.status(500).json({ data: null, error: (error as Error).message })
    }
}
