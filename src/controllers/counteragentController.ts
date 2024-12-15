import { Request, Response } from 'express';
import axios from 'axios';
import { accessToken, encodeCredentials } from '../utils/getAccessToken';

const MOYSKLAD_BASE_URL = 'https://api.moysklad.ru/api/remap/1.2';

/**
  Fetch a list of all Counterparties.
**/
export const getAllCounteragents = async (req: Request, res: Response) => {
    try {
        const { limit = 4, offset = 0 } = req.query;
        const token = await accessToken();

        const response: any = await axios.get(`${MOYSKLAD_BASE_URL}/entity/counterparty`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip',
            },
            params: {
                limit: parseInt(limit as string, 10),
                offset: parseInt(offset as string, 10),
            },
        });
        const data = response.data.rows.map((i: any) => {
            return {
                id: i.id,
                accountId: i.accountId,
                shared: i.shared,
                name: i.name,
                code: i.code,
                externalCode: i.externalCode,
                archived: i.archived,
                companyType: i.companyType,
                legalTitle: i.legalTitle,
                legalAddress: i.legalAddress,
                actualAddressFull: i.actualAddressFull?.comment,
                inn: i.inn,
                phone: i.phone,
                salesAmount: i.salesAmount,

            }
        })

        res.status(200).json({
            totalCounteragents: response.data.meta.size,
            counteragents: data,
        });
    } catch (error) {
        console.error('Error fetching all counteragents:', error);
        res.status(500).json({ message: 'Error fetching counteragents', error });
    }
};

/**
 * Fetch a single Counterparty by ID.
 */
export const getSingleCounteragent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const token = await accessToken();

        let counterpartyId = ''
        let accountId = ''
        const response: any = await axios.get(`${MOYSKLAD_BASE_URL}/entity/counterparty/${counterpartyId}/accounts/${accountId}`, {
            headers: {
                Authorization: `Basic ${encodeCredentials()}`,
                "Accept-Encoding": "gzip",
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching counteragent:', error);
        res.status(500).json({ message: 'Error fetching counteragent', error });
    }
};
