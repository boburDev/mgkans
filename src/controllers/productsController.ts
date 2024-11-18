import { Request, Response } from 'express';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = {
            recommended: [
                {
                    path: '/products/recommended.png',
                    definition: `Maktab uchun kanselyariya to’plami Kuromi, Cinnamoroll`,
                    price: ''
                }
            ],
            sumka: [
                {
                    path: '/products/sumka.png',
                    definition: `Maktab uchun kanselyariya to’plami Kuromi, Cinnamoroll`,
                    price: ''
                }
            ],
            daftar: [
                {
                    path: '/products/daftar.png',
                    definition: `Maktab uchun kanselyariya to’plami Kuromi, Cinnamoroll`,
                    price: ''
                }
            ],
            uquvqurollari: [
                {
                    path: '/products/ruchkaqalam.png',
                    definition: `Maktab uchun kanselyariya to’plami Kuromi, Cinnamoroll`,
                    price: ''
                }
            ]
        }

        res.status(201).json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};