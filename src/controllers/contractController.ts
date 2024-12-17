import { Request, Response } from 'express';
import axios from 'axios';


const fetchMetaData = async (href: string, authHeader: string) => {
    try {
        const response = await axios.get(href, {
            headers: {
                Authorization: authHeader,
                'Accept-Encoding': 'gzip',
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching meta data:', error.message);
        return null;
    }
};


export const getAllContracts = async (req: Request, res: Response): Promise<any> => {
    try {
        
        const login = process.env.LOGIN;
        const password = process.env.PASSWORD;

        if (!login || !password) {
            return res.status(400).json({ message: 'Missing login or password in environment variables' });
        }

        
        const authString = `${login}:${password}`;
        const encodedAuth = Buffer.from(authString).toString('base64');
        const authHeader = `Basic ${encodedAuth}`; 

        
        const contractResponse: any = await axios.get(
            'https://api.moysklad.ru/api/remap/1.2/entity/contract',
            {
                headers: {
                    Authorization: authHeader,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const contracts = contractResponse.data.rows || [];

        
        const processedContracts = await Promise.all(
            contracts.map(async (contract: any) => {
                const processedContract = { ...contract };

                
                if (contract.agent?.meta?.href) {
                    const agentData:any = await fetchMetaData(contract.agent.meta.href, authHeader);
                    
                    
                    if (agentData) {
                        const financialData = {
                            balance: agentData.balance || null,
                            payables: agentData.payables || null,
                            salesAmount: agentData.salesAmount || null,
                            debt: agentData.debt || null,  
                        };
                        processedContract.agent = financialData;
                    } else {
                        processedContract.agent = { message: 'Agent data unavailable' };
                    }
                }

                
                delete processedContract.meta;

                return processedContract;
            })
        );

        
        res.status(200).json({ data: processedContracts });
    } catch (error: any) {
        console.error('Error fetching contracts:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Error fetching contracts',
            error: error.response?.data || error.message,
        });
    }
};


export const getContractSingle = async (req: Request, res: Response): Promise<any> => {
    try {
        if (!req?.user?.isLegal) throw new Error("User is not legal");
        const id = req?.user?.userLegal?.conterAgentId
        
        if (!id) {
            res.status(200).json({ data: null });
            return
        }
        const login = process.env.LOGIN;
        const password = process.env.PASSWORD;
        
        if (!login || !password) {
            return res.status(400).json({ message: 'Missing login or password in environment variables' });
        }

        const authString = `${login}:${password}`;
        const encodedAuth = Buffer.from(authString).toString('base64');
        const authHeader = `Basic ${encodedAuth}`;

        const contractResponse: any = await axios.get(
            `https://api.moysklad.ru/api/remap/1.2/report/counterparty/${id}`,
            {
                headers: {
                    Authorization: authHeader,
                    'Accept-Encoding': 'gzip',
                },
            }
        );

        const contracts = contractResponse.data || {};
        const info = {
            id: contracts?.counterparty?.id,
            name: contracts?.counterparty?.name,
            phone: contracts?.counterparty?.phone,
            inn: contracts?.counterparty?.inn,
            balance: contracts.balance,
            // discountsSum: contracts.discountsSum
        }

        res.status(200).json({ data: info });
    } catch (error: any) {
        console.error('Error fetching contracts:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Error fetching contracts',
            error: error.response?.data || error.message,
        });
    }
};
