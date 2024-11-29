import jwt from 'jsonwebtoken'
import User from '../types/user';
import { Admin } from '../models/adminUser';

const secretKey: string = process.env.SECRET_KEY || 'not_allowed'

export const generateToken = (id: string, isLegal: boolean = false): string => {
    return jwt.sign({ id, isLegal }, secretKey, { expiresIn: '5h' });
};

export function verify(token: string): User | null {
    try {
        const decoded: User = jwt.verify(token, secretKey) as User;
        return decoded;
    } catch (error) {
        return null;
    }
}

export function verifyAdmin(token: string): Admin | null {
    try {
        const decoded: Admin = jwt.verify(token, secretKey) as Admin;
        return decoded;
    } catch (error) {
        return null;
    }
}