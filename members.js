const express = require('express');
const router = express.Router();
const { createMember, getMember, updateMember, getAllMembers, addFamilyAccess } = require('../controllers/memberController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', createMember);
router.get('/', authorize('Super Administrator', 'Admin'), getAllMembers);
router.get('/:memberId', getMember);
router.put('/:memberId', updateMember);
router.post('/:memberId/family-access', addFamilyAccess);

module.exports = router;
