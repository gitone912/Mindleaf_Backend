const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const axios = require('axios');

// Load Google Service Account JSON key
const serviceAccount = JSON.parse(fs.readFileSync('mind-leaf-0378d3536e0c.json'));

// Function to get an OAuth2 token
async function getAccessToken() {
    try {
        const auth = new GoogleAuth({
            credentials: serviceAccount,
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        return accessToken.token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null;
    }
}

async function verifyPurchase(packageName, productId, purchaseToken) {
    try {
        const accessToken = await getAccessToken();
        const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return response.data;
    } catch (error) {
        console.error('Purchase verification failed:', error.response?.data || error.message);
        return null;
    }
}

module.exports = { verifyPurchase };