const { db } = require('../utils/firebaseConfig');
const { google } = require('googleapis');

const authenticateGooglePlay = async () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'mind-leaf-0378d3536e0c.json', // Ensure you have the right service account key file
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });
    return await auth.getClient();
};

const verifyPurchaseWithGoogle = async (packageName, productId, purchaseToken) => {
    try {
        const authClient = await authenticateGooglePlay();
        const androidPublisher = google.androidpublisher({ version: 'v3', auth: authClient });
        
        const response = await androidPublisher.purchases.products.get({
            packageName,
            productId,
            token: purchaseToken
        });
        
        return response.data;
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
        
        const purchaseData = await verifyPurchaseWithGoogle(packageName, productId, purchaseToken);
        console.log('Purchase verification response:', purchaseData);
        
        if (purchaseData.purchaseState !== 0) { // 0 means purchased successfully
            console.log('Invalid purchase state:', purchaseData.purchaseState);
            return res.status(400).json({
                success: false,
                message: 'Invalid purchase state'
            });
        }
        
        // Ensure purchase is not already consumed
        if (purchaseData.consumptionState === 1) {
            console.log('Purchase already consumed:', purchaseToken);
            return res.status(400).json({
                success: false,
                message: 'Purchase already consumed'
            });
        }
        
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

        return res.status(200).json({
            success: true,
            message: 'Leaves added successfully',
            currentLeaves: newLeafCount
        });
    } catch (error) {
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

        return res.status(200).json({
            success: true,
            message: 'Subscription verified and updated successfully',
            expiryDate: subscriptionExpiry
        });

    } catch (error) {
        console.error('Error in verifySubscription:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


module.exports = { addLeaves, verifySubscription };
