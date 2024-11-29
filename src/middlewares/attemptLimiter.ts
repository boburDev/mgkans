import { NextFunction, Request, Response } from 'express'

interface LoginAttempts {
    [ip: string]: {
        attempts: number;
        firstAttemptTime: number;
        blockedUntil: number | null;
    };
}

let loginAttempts: LoginAttempts = {};


export function loginAttemptLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || '';
    const currentTime = Date.now();
    const loginLimit = 5;
    const blockDuration = 5 * 60 * 1000;
    const attemptWindow = 60 * 1000;

    if (!loginAttempts[ip]) {
        loginAttempts[ip] = {
            attempts: 0,
            firstAttemptTime: currentTime,
            blockedUntil: null,
        };
    }

    const userAttempts = loginAttempts[ip];

    if (userAttempts.blockedUntil && userAttempts.blockedUntil > currentTime) {
        const blockTimeLeft = Math.ceil((userAttempts.blockedUntil - currentTime) / 1000);
        res.status(429).json({
            message: `Too many login attempts. Try again in ${blockTimeLeft} seconds.`,
        });
        return;
    }

    if (currentTime - userAttempts.firstAttemptTime < attemptWindow) {
        userAttempts.attempts += 1;
    } else {
        userAttempts.attempts = 1;
        userAttempts.firstAttemptTime = currentTime;
    }

    if (userAttempts.attempts > loginLimit) {
        userAttempts.blockedUntil = currentTime + blockDuration;
        res.status(429).json({
            message: 'Too many login attempts. Please try again in 5 minutes.',
        });
        return;
    }

    next();
}