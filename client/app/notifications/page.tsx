'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AppLayout from "../AppLayout";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { deleteInvi } from "@/lib/features/InvitationsSlice";
import { addTeam } from "@/lib/features/TeamsSlice";
import { toast } from "sonner";
import axios from "axios";
import { PROJECT_SERVICE_URL } from "@/constants/API_URLS";

// This would typically come from your API
const mockNotifications = [
  {
    id: 1,
    title: "New Project Created",
    description: "Project 'Marketing Campaign' has been created",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    title: "Task Assigned",
    description: "You have been assigned to 'Design Homepage'",
    time: "5 hours ago",
    read: true,
  },
];

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { invitations } = useSelector((state: RootState) => state.Invitations);
  const { token } = useSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState("notifications");
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const handleAcceptInvitation = async (Invitoken: string) => {
    setIsLoading(prev => ({ ...prev, [Invitoken]: true }));

    try {
      const res = await axios.post(PROJECT_SERVICE_URL + '/api/invitations/accept', { token: Invitoken }, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      // Update Redux store
      dispatch(deleteInvi(Invitoken));
      if (res.data.team) {
        dispatch(addTeam(res.data.team));
      }

      toast.success('Invitation accepted successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to accept invitation');
      } else {
        toast.error('Failed to accept invitation');
      }
    } finally {
      setIsLoading(prev => ({ ...prev, [Invitoken]: false }));
    }
  };

  const handleDeclineInvitation = async (Invitoken: string) => {
    setIsLoading(prev => ({ ...prev, [Invitoken]: true }));

    try {
      const res = await axios.post(PROJECT_SERVICE_URL + '/api/invitations/decline', { token: Invitoken }, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (res.status === 200) {
        dispatch(deleteInvi(Invitoken));
        toast.success('Invitation declined successfully');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to decline invitation');
      } else {
        toast.error('Failed to decline invitation');
      }
    } finally {
      setIsLoading(prev => ({ ...prev, [Invitoken]: false }));
    }
  };

  const getPendingInvitationsCount = () => {
    return invitations.filter(inv => inv.status === 'pending').length;
  };

  console.log(activeTab);

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Notifications Center</h1>

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger
                value="notifications"
                onClick={() => setActiveTab("notifications")}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notifications
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
                {mockNotifications.map((notification) => (
                  <Card key={notification.id} className={notification.read ? 'opacity-80' : ''}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Bell className={`h-5 w-5 ${notification.read ? 'text-muted-foreground' : 'text-blue-500'}`} />
                      <div className="space-y-1">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        <CardDescription>{notification.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{notification.time}</span>
                        {!notification.read && (
                          <Button variant="ghost" size="sm">
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invitations">
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <UserPlus className="h-5 w-5 text-blue-500" />
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          Invitation to join {invitation.team.name}
                        </CardTitle>
                        <CardDescription>
                          as {invitation.role}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {new Date(invitation.created_at).toLocaleString('en-US', {
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
                            onClick={() => handleAcceptInvitation(invitation.token)}
                            disabled={isLoading[invitation.token]}
                          >
                            {isLoading[invitation.token] ? 'Accepting...' : 'Accept'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineInvitation(invitation.token)}
                            disabled={isLoading[invitation.token]}
                          >
                            {isLoading[invitation.token] ? 'Declining...' : 'Decline'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
} 