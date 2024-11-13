import jwt from 'jsonwebtoken'
import { PUser } from '../models/physical-user';
import { LUser } from '../models/legal-user';
import User from '../types/user';

const secretKey: string = process.env.SECRET_KEY || 'not_allowed'

export const generateToken = (id: string, isLegal: boolean = false): string => {
    return jwt.sign({ id, isLegal }, secretKey, { expiresIn: '1h' });
};

export function verify(token: string): User | null {
    try {
        const decoded: User = jwt.verify(token, secretKey) as User;
        return decoded;
    } catch (error) {
        return null;
    }
}