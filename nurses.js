const express = require('express');
const router = express.Router();
const { createNurse, getAllNurses, getNurse, updateAvailability, assignNurseToMember } = require('../controllers/nurseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('Super Administrator', 'Admin'), createNurse);
router.get('/', getAllNurses);
router.get('/:nurseId', getNurse);
router.put('/:nurseId/availability', updateAvailability);
router.post('/assign', authorize('Super Administrator', 'Admin'), assignNurseToMember);

module.exports = router;
