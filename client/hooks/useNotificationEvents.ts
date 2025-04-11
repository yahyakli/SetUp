import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/lib/features/NotificationsSlice';
import { addInvitation, updateInvitation } from '@/lib/features/InvitationsSlice';
import { Notification, Invitation } from '@/types/index';

export function useNotificationEvents() {
  const { notificationSocket } = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!notificationSocket) return;

    // Handle new notifications
    const handleNewNotification = (notification: Notification) => {
      dispatch(addNotification(notification));
      // You could also play a sound or show a toast notification here
    };

    // Handle new invitations
    const handleNewInvitation = (invitation: Invitation) => {
      dispatch(addInvitation(invitation));
      // You could also play a sound or show a toast notification here
    };

    // Handle invitation updates
    const handleInvitationUpdated = (invitation: Invitation) => {
      dispatch(updateInvitation(invitation));
    };

    // Register event listeners
    notificationSocket.on('new_notification', handleNewNotification);
    notificationSocket.on('new_invitation', handleNewInvitation);
    notificationSocket.on('invitation_updated', handleInvitationUpdated);

    // Clean up listeners on unmount
    return () => {
      notificationSocket.off('new_notification', handleNewNotification);
      notificationSocket.off('new_invitation', handleNewInvitation);
      notificationSocket.off('invitation_updated', handleInvitationUpdated);
    };
  }, [notificationSocket, dispatch]);
} 