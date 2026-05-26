const express = require('express');
const router = express.Router();
const { bookVisit, getMemberVisits, getNurseVisits, completeVisit, cancelVisit } = require('../controllers/visitController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', bookVisit);
router.get('/member/:memberId', getMemberVisits);
router.get('/nurse/:nurseId', getNurseVisits);
router.put('/:visitId/complete', authorize('Nurse', 'Admin', 'Super Administrator'), completeVisit);
router.put('/:visitId/cancel', cancelVisit);

module.exports = router;
