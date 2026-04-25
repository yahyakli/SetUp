'use client';

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import AppLayout from "../AppLayout";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { deleteInvi } from "@/lib/features/InvitationsSlice";
import { addTeam } from "@/lib/features/TeamsSlice";
import { toast } from "sonner";
import axios from "axios";
import { NOTIFICATION_SERVICE_URL } from "@/constants/API_URLS";
import { Invitation } from "@/types/index";
import { markAllNotificationsAsRead as markAllAsRead } from "@/lib/features/NotificationsSlice";
import Loader from "@/components/Loader";

// Create a separate component for the notifications content
function NotificationsContent() {
  const dispatch = useDispatch();
  const { invitations } = useSelector((state: RootState) => state.Invitations);
  const { notifications } = useSelector((state: RootState) => state.notification);
  const { token, user } = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState("notifications");
  const [acceptLoading, setAcceptLoading] = useState<{ [key: string]: boolean }>({});
  const [declineLoading, setDeclineLoading] = useState<{ [key: string]: boolean }>({});
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const handleAcceptInvitation = async (Invitation: Invitation) => {
    setAcceptLoading(prev => ({ ...prev, [Invitation._id]: true }));

    try {
      const res = await axios.put(NOTIFICATION_SERVICE_URL + '/api/invitations/' + Invitation._id, { status: 'accepted' }, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      // Update Redux store
      dispatch(deleteInvi(Invitation._id));
      if (res.data) {
        dispatch(addTeam(res.data));
      }

      toast.success('Invitation accepted successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to accept invitation');
      } else {
        toast.error('Failed to accept invitation');
      }
    } finally {
      setAcceptLoading(prev => ({ ...prev, [Invitation._id]: false }));
    }
  };

  const handleDeclineInvitation = async (invitation: Invitation) => {
    setDeclineLoading(prev => ({ ...prev, [invitation._id]: true }));

    try {
      const res = await axios.put(NOTIFICATION_SERVICE_URL + '/api/invitations/' + invitation._id, { status: 'declined' }, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (res.status === 200) {
        dispatch(deleteInvi(invitation._id));
        toast.success('Invitation declined successfully');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to decline invitation');
      } else {
        toast.error('Failed to decline invitation');
      }
    } finally {
      setDeclineLoading(prev => ({ ...prev, [invitation._id]: false }));
    }
  };

  const getPendingInvitationsCount = () => {
    return invitations.filter(inv => inv.status === 'pending').length;
  };

  const getPendingNotificationsCount = () => {
    return notifications.filter(not => !not.read).length;
  };

  // Wrap the function with useCallback
  const markAllNotificationsAsRead = useCallback(async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    const notificationIds = unreadNotifications.map(n => n._id);
    setMarkingAsRead(true);

    try {
      await axios.post(
        `${NOTIFICATION_SERVICE_URL}/api/notifications/read/${user?.id}`, 
        { notificationsIds: notificationIds },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update Redux store
      dispatch(markAllAsRead(notificationIds));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to mark notifications as read');
      } else {
        toast.error('Failed to mark notifications as read');
      }
    } finally {
      setMarkingAsRead(false);
    }
  }, [notifications, user, token, dispatch]);

  // Effect to mark all notifications as read when entering the notifications tab
  useEffect(() => {
    if (activeTab === "notifications" && notifications.some(n => !n.read)) {
      markAllNotificationsAsRead();
    }
  }, [activeTab, markAllNotificationsAsRead, notifications]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Notifications Center</h1>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="notifications"
              onClick={() => setActiveTab("notifications")}
              className="flex items-center gap-2 relative"
            >
              <Bell className="h-4 w-4" />
              Notifications
              {getPendingNotificationsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white dark:bg-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getPendingNotificationsCount()}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="invitations"
              onClick={() => setActiveTab("invitations")}
              className="flex items-center gap-2 relative"
            >
              <UserPlus className="h-4 w-4" />
              Invitations
              {getPendingInvitationsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white dark:bg-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getPendingInvitationsCount()}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications">
            <div className="space-y-4">
              {markingAsRead && (
                <div className="text-sm text-muted-foreground mb-2">Marking notifications as read...</div>
              )}
              {notifications.length > 0 ? notifications.map((notification) => (
                <Card key={notification._id} className={notification.read ? 'opacity-80' : ''}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Bell className={`h-5 w-5 ${notification.read ? 'text-muted-foreground' : 'text-blue-500'}`} />
                    <div className="space-y-1">
                      <CardTitle className="text-base">{notification.title}</CardTitle>
                      <CardDescription>{notification.content}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{formatDate(notification.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground max-w-sm">
                    When you receive notifications about your projects and teams, they&#39;ll appear here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="invitations">
            <div className="space-y-4">
              {invitations.length > 0 ? invitations.map((invitation) => (
                <Card key={invitation._id}>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <UserPlus className="h-5 w-5 text-blue-500" />
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        Invitation to join {invitation.teamName}
                      </CardTitle>
                      <CardDescription>
                        as {invitation.role}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {new Date(invitation.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <div className="space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={acceptLoading[invitation._id] || declineLoading[invitation._id]}
                        >
                          {acceptLoading[invitation._id] ? 'Accepting...' : 'Accept'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineInvitation(invitation)}
                          disabled={acceptLoading[invitation._id] || declineLoading[invitation._id]}
                        >
                          {declineLoading[invitation._id] ? 'Declining...' : 'Decline'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
                  <p className="text-muted-foreground max-w-sm">
                    When you receive invitations to join teams, they&#39;ll appear here for you to accept or decline.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function NotificationsPage() {
  return (
    <AppLayout>
      <Suspense fallback={<Loader />}>
        <NotificationsContent />
      </Suspense>
    </AppLayout>
  );
} 

// Disable static generation for this page
export const dynamic = 'force-dynamic';