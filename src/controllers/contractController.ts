import { Request, Response } from 'express';
import axios from 'axios';

// Utility function to fetch data from the meta href URL with the same Authorization header
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

// Main function to fetch all contracts
export const getAllContracts = async (req: Request, res: Response): Promise<any> => {
    try {
        // Get login and password from environment variables
        const login = process.env.LOGIN;
        const password = process.env.PASSWORD;

        if (!login || !password) {
            return res.status(400).json({ message: 'Missing login or password in environment variables' });
        }

        // Create Basic Authentication string and encode it in Base64
        const authString = `${login}:${password}`;
        const encodedAuth = Buffer.from(authString).toString('base64');
        const authHeader = `Basic ${encodedAuth}`; // This will be used for both main and meta requests

        // Fetch contracts
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

        // Process each contract and fetch data for meta fields, especially financial info for agents
        const processedContracts = await Promise.all(
            contracts.map(async (contract: any) => {
                const processedContract = { ...contract };

                // Handle agent meta fields and extract only financial data
                if (contract.agent?.meta?.href) {
                    const agentData:any = await fetchMetaData(contract.agent.meta.href, authHeader);
                    
                    // Extract relevant financial data from agent (if available)
                    if (agentData) {
                        const financialData = {
                            balance: agentData.balance || null,
                            payables: agentData.payables || null,
                            salesAmount: agentData.salesAmount || null,
                            debt: agentData.debt || null,  // Adjust if specific debt info is available
                        };
                        processedContract.agent = financialData;
                    } else {
                        processedContract.agent = { message: 'Agent data unavailable' };
                    }
                }

                // Remove any `meta` fields if needed
                delete processedContract.meta;

                return processedContract;
            })
        );

        // Respond with the processed contracts that contain only financial data for agents
        res.status(200).json({ data: processedContracts });
    } catch (error: any) {
        console.error('Error fetching contracts:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Error fetching contracts',
            error: error.response?.data || error.message,
        });
    }
};
