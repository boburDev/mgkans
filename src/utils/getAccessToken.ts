import axios from 'axios';
import 'dotenv/config';

export const encodeCredentials = (): string => {
    return Buffer.from(`${process.env.LOGIN}:${process.env.PASSWORD}`).toString('base64');
}

export const accessToken = async() => {
    const apiUrl: string = 'https://api.moysklad.ru/api/remap/1.2/security/token';

    const encodedCredentials: string = encodeCredentials();

    try {
        const response: any = await axios.post(apiUrl, null, {
            headers: {
                Authorization: `Basic ${encodedCredentials}`,
                'Accept-Encoding': 'gzip',
            },
        });

        return response?.data?.access_token;
    } catch (error: any) {
        console.error('Error fetching access token:', error.message);
    }
};