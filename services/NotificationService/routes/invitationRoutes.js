import express from 'express';
import invitationController from '../controllers/invitationController.js';
import authMiddleware from '../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware);

// Create a new invitation
router.post('/', invitationController.createInvitation);

// Get all invitations for a user
router.get('/user/:userId', invitationController.getUserInvitations);

// Get all invitations for a team
router.get('/team/:teamId', invitationController.getTeamInvitations);

// Update an invitation
router.put('/:id', invitationController.updateInvitation);

export default router; 