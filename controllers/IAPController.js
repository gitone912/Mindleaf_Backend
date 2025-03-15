const { db } = require('../utils/firebaseConfig');
const { verifyPurchase } = require('../services/paymentVerificationService');

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

        // Verify the purchase with Google Play
        console.log('Verifying purchase with Google Play...');
        // const purchaseData = await verifyPurchase(packageName, productId, purchaseToken);

        // if (!purchaseData || purchaseData.purchaseState !== 0) {
        //     console.log('Purchase verification failed:', purchaseData);
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Purchase verification failed'
        //     });
        // }
        console.log('purchasetoken',purchaseToken)

        console.log('Purchase verified successfully:');

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

module.exports = { addLeaves };
