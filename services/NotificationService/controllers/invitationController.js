import Invitation from '../models/Invitation.js';
import { createInvitationSchema, updateInvitationSchema } from '../validation/invidationValidation.js';
import axios from 'axios';

class InvitationController {

  // Create a new invitation
  async createInvitation(req, res) {
    try {
      // Validate request body
      const { error, value } = createInvitationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const invitation = new Invitation(value);
      await invitation.save();

      // Emit socket event to the user
      req.io.to(value.userId).emit('new_invitation', invitation);

      return res.status(201).json(invitation);
    } catch (error) {
      console.error('Error creating invitation:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get all invitations for a user
  async getUserInvitations(req, res) {
    try {
      const userId = req.params.userId; 

      const invitations = await Invitation.find({ userId, status: 'pending' })
        .sort({ createdAt: -1 });

      return res.status(200).json(invitations);
    } catch (error) {
      console.error('Error getting user invitations:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Update an invitation
  async updateInvitation(req, res) {
    try {
      // Validate request body
      const { error, value } = updateInvitationSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      
      const invitation = await Invitation.findById(
        req.params.id,
      );  

      if (!invitation) {
        return res.status(404).json({ message: 'Invitation not found' });
      }

      // Store the original user ID before updating
      const userId = invitation.userId;

      if (value.status === 'accepted') {
        invitation.status = 'accepted';
        const response = await axios.post(`${process.env.PROJECT_SERVICE_URL}/api/team-members`, {
          team_id: invitation.teamId,
          user_id: invitation.userId,
          role: invitation.role
        }, {
          headers: {
            'Authorization': `Bearer ${req.headers.authorization}`
          }
        });

        if (response.status === 201) {
          await invitation.save();
          
          // Emit socket event for invitation update
          req.io.to(userId).emit('invitation_updated', invitation);
          
          return res.status(200).json(response.data);
        }
      } else if (value.status === 'declined') {
        invitation.status = 'declined';
        await invitation.save();
        
        // Emit socket event for invitation update
        req.io.to(userId).emit('invitation_updated', invitation);
        
        return res.status(200).json(invitation);
      }

    } catch (error) {
      console.error('Error updating invitation:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  //get all invitations for a team
  async getTeamInvitations(req, res) {
    try {
      const teamId = req.params.teamId;
      const invitations = await Invitation.find({ teamId, status: 'pending' })
        .sort({ createdAt: -1 });

      return res.status(200).json(invitations);
    } catch (error) {
      console.error('Error getting team invitations:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

}

export default new InvitationController();

