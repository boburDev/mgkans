import axios from 'axios';

/**
 * Fetches additional details from a MoySklad `meta` href.
 *
 * @param href - The URL to fetch meta details from.
 * @param token - The authorization token for MoySklad API.
 * @returns The resolved meta details, or `null` if an error occurs.
 */


export const fetchMetaDetails = async (href: string, token: string): Promise<any> => {
    try {
        const response:any = await axios.get(href, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.rows;
    } catch (error) {
        console.error(`Error fetching details from ${href}:`, error);
        return null;
    }
};
