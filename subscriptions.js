const express = require('express');
const router = express.Router();
const { getPlans, createSubscription, getMemberSubscription, cancelSubscription } = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/plans', getPlans); // Public

router.use(authenticate);
router.post('/', createSubscription);
router.get('/member/:memberId', getMemberSubscription);
router.put('/:subscriptionId/cancel', cancelSubscription);

module.exports = router;
