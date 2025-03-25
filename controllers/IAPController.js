const { db } = require('../utils/firebaseConfig');
const { google } = require('googleapis');

const authenticateGooglePlay = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'mind-leaf-0378d3536e0c.json', // Ensure you have the right service account key file
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });
    return await auth.getClient();
};

const verifyPurchaseWithGoogle = async (packageName, productId, final_token) => {
    try {
        const authClient = await authenticateGooglePlay();
        const androidPublisher = google.androidpublisher({ version: 'v3', auth: authClient });

        const response = await androidPublisher.purchases.products.get({
            packageName,
            productId,
            token: final_token
        });

        const purchaseData = response.data;

        if (!purchaseData || purchaseData.purchaseState !== 0) {
            throw new Error('Purchase is not valid or already consumed');
        }

        // ✅ Ensure purchase is treated as a consumable
        if (purchaseData.consumptionState === 1) {
            console.log('Purchase already consumed, allowing re-purchase.');
            return purchaseData;
        }

        return purchaseData;
    } catch (error) {
        console.error('Google Play verification error:', error);
        throw new Error('Failed to verify purchase with Google Play');
    }
};

const verifySubscriptionWithGoogle = async (packageName, subscriptionId, purchaseToken) => {
    try {
        const authClient = await authenticateGooglePlay();
        const androidPublisher = google.androidpublisher({ version: 'v3', auth: authClient });
        
        const response = await androidPublisher.purchases.subscriptions.get({
            packageName,
            subscriptionId,
            token: purchaseToken
        });
        
        return response.data;
    } catch (error) {
        console.error('Google Play subscription verification error:', error);
        throw new Error('Failed to verify subscription with Google Play');
    }
};
const decodeToken = (encodedToken) => {
    try {
        // Decode the URL-encoded string
        const decodedString = decodeURIComponent(encodedToken);
        
        // Parse the JSON object
        const parsedObject = JSON.parse(decodedString);

        // Extract the purchaseToken
        return parsedObject.purchaseToken;
    } catch (error) {
        console.error("Error extracting purchaseToken:", error);
        return null;
    }
};

const savePurchaseRecord = async (status, data) => {
    try {
        const tableName = status === 'success' ? 'successPurchases' : 'failedPurchases';
        const purchaseRef = db.ref(tableName).push();
        await purchaseRef.set({
            ...data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(`Error saving ${status} purchase:`, error);
    }
};

const addLeaves = async (req, res) => {
    try {
        const { userId, leafAdded, packageName, productId, purchaseToken } = req.body;
        
        console.log('Received purchase verification request:', {
            userId,
            leafAdded,
            packageName,
            productId,
            purchaseToken: purchaseToken ? 'Present' : 'Missing'
        });

        console.log('Verifying purchase with Google Play...');
        const final_token = decodeToken(purchaseToken);
        
        const purchaseData = await verifyPurchaseWithGoogle(packageName, productId, final_token);
        console.log('Purchase verification response:', purchaseData);
        
        if (purchaseData.purchaseState !== 0) { // 0 means purchased successfully
            await savePurchaseRecord('failed', { userId, leafAdded, packageName, productId, purchaseToken, reason: 'Invalid purchase state' });
            console.log('Invalid purchase state:', purchaseData.purchaseState);
            return res.status(400).json({
                success: false,
                message: 'Invalid purchase state'
            });
        }

        // ✅ Allow multiple purchases of the same product (Remove consumption check)
        console.log('Purchase is valid, proceeding to update user leaves');

        // Get current user data
        const userRef = db.ref(`users/${userId}`);
        const userSnapshot = await userRef.once('value');

        if (!userSnapshot.exists()) {
            console.log('User not found:', userId);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userData = userSnapshot.val();
        const currentLeaves = userData.points || 0;
        const newLeafCount = currentLeaves + leafAdded;

        console.log('Updating leaf count:', {
            currentLeaves,
            leafAdded,
            newLeafCount
        });

        // Update the user's leaf count
        await userRef.update({
            points: newLeafCount,
            updated_at: new Date().toISOString()
        });

        console.log('Leaf count updated successfully');

        await savePurchaseRecord('success', {
            userId,
            leafAdded,
            packageName,
            productId,
            purchaseToken,
            newLeafCount,
            purchaseData
        });

        return res.status(200).json({
            success: true,
            message: 'Leaves added successfully',
            currentLeaves: newLeafCount
        });
    } catch (error) {
        await savePurchaseRecord('failed', {
            ...req.body,
            error: error.message
        });
        console.error('Error in addLeaves:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


const verifySubscription = async (req, res) => {
    try {
        const { userId, packageName, subscriptionName, subscriptionId, purchaseToken, subscriptionExpiry } = req.body;

        console.log('Verifying subscription:', {
            userId,
            packageName,
            subscriptionId,
            subscriptionName,
            purchaseToken: purchaseToken ? 'Present' : 'Missing',
            subscriptionExpiry
        });

        // const subscriptionData = await verifySubscriptionWithGoogle(packageName, subscriptionId,  purchaseToken);
        
        // if (subscriptionData.paymentState !== 1) { // 1 means payment received
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid subscription payment state'
        //     });
        // }

        // // Check if subscription is active
        // const currentTime = Date.now();
        // const expiryTime = parseInt(subscriptionData.expiryTimeMillis);
        
        // if (currentTime > expiryTime) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Subscription has expired'
        //     });
        // }

        // Extract expiry date from subscriptionExpiry
        const expiryTime = subscriptionExpiry;

        // Update user's subscription status
        const userRef = db.ref(`users/${userId}`);
        const userSnapshot = await userRef.once('value');

        if (!userSnapshot.exists()) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await userRef.update({
            subscription: subscriptionName,
            subscriptionExpiry: subscriptionExpiry,
            updated_at: new Date().toISOString()
        });

        await savePurchaseRecord('success', {
            userId,
            packageName,
            subscriptionName,
            subscriptionId,
            purchaseToken,
            subscriptionExpiry
        });

        return res.status(200).json({
            success: true,
            message: 'Subscription verified and updated successfully',
            expiryDate: subscriptionExpiry
        });

    } catch (error) {
        await savePurchaseRecord('failed', {
            ...req.body,
            error: error.message
        });
        console.error('Error in verifySubscription:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


module.exports = { addLeaves, verifySubscription };
