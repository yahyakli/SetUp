"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Users,
  Calendar,
  Settings,
  ClipboardList,
  Mail,
  UserPlus
} from 'lucide-react'
import AppLayout from '../../AppLayout'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { PROJECT_SERVICE_URL, USERS_SERVICE_URL } from '@/constants/API_URLS'
import { Team, User } from '@/types'
import UserAvatar from '@/components/UserAvatar'

export default function Page() {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { user, token } = useSelector((state: RootState) => state.user)
  const [team, setTeam] = useState<Team | null>(null)
  const [usersData, setUsersData] = useState<Record<string, User>>({})
  const [isPending, setIsPending] = useState(true)
  const [activeTab, setActiveTab] = useState('members')

  useEffect(() => {
    if (token && user?.id && id) {
      const loadTeam = async () => {
        setIsPending(true);
        try {
          // Fetch team details
          const res = await axios.get(PROJECT_SERVICE_URL + `/api/teams/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (res.status === 200) {
            const teamData: Team = res.data.team;
            setTeam(teamData);


            // Collect all unique member IDs from team
            const memberIds = teamData.members.map(member => member.user_id);

            // Fetch full user data for each member
            const userResponses = await Promise.all(
              memberIds.map(async (memberId) => {
                try {
                  const userRes = await axios.get(USERS_SERVICE_URL + `/api/users/${memberId}`, {
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  });
                  return userRes.data;
                } catch (error) {
                  console.error(`Failed to fetch user ${memberId}`, error);
                  return null;
                }
              })
            );

            // Create a map of userId -> fullUserData
            const userDataMap = userResponses.filter(Boolean).reduce((acc, userData) => {
              acc[userData.id] = userData;
              return acc;
            }, {});

            setUsersData(userDataMap);
          }
        } catch (err) {
          console.error(err);
          if (err instanceof AxiosError) {
            toast.error(err.response?.data.message || 'Failed to load team');
          } else {
            toast.error('Failed to load team details');
          }
          // Redirect back to teams page if team not found
          router.push('/teams');
        } finally {
          setIsPending(false);
        }
      };

      loadTeam();
    }
  }, [id, user?.id, token, router, dispatch]);

  // Gets initials from name
  const getInitials = (userId: string) => {
    const userData = usersData[userId];
    if (userData && userData.firstName && userData.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
    }
    return 'XX'; // Fallback initials
  }

  // Format date helper
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Skeleton loader component for the team page
  const TeamDetailsSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center">
        <Skeleton className="h-10 w-10 rounded-full mr-4" />
        <div>
          <Skeleton className="h-8 w-60 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <Skeleton className="h-32 w-full" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>

      <div>
        <Skeleton className="h-10 w-60 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6 dark:bg-gray-900 bg-gray-50 min-h-screen">
        {/* Back to Teams button */}
        <div className="mb-4">
          <Link href="/teams">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Button>
          </Link>
        </div>

        {isPending ? (
          <TeamDetailsSkeleton />
        ) : team ? (
          <>
            {/* Team Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold mr-4">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold dark:text-white">{team.name}</h1>
                  <p className="text-muted-foreground">
                    {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'} • Created {team.created_at ? formatDate(team.created_at) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>

            {/* Team Description Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700 mb-8">
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="dark:text-gray-300">
                  {team.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{team.members.length}</p>
                      <p className="text-muted-foreground">Team Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <ClipboardList className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-muted-foreground">Active Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-primary mr-3" />
                    <div>
                      <p className="text-2xl font-bold">{team.created_at ? formatDate(team.created_at).split(',')[0] : 'N/A'}</p>
                      <p className="text-muted-foreground">Created</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Team Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="members">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="projects">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Projects
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="members" className="space-y-4">
                <div className="mb-6 flex justify-end">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members.map((member) => {
                    const memberData = usersData[member.user_id] || {};
                    const isCurrentUser = member.user_id === user?.id;

                    return (
                      <Card key={member.user_id} className="dark:bg-gray-800 dark:border-gray-700">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={memberData} />
                            <div>
                              <p className="font-medium">
                                {memberData.firstName && memberData.lastName ?
                                  `${memberData.firstName} ${memberData.lastName}` : 'Unknown Member'}
                                {isCurrentUser && <span className="ml-2 text-sm text-muted-foreground">(You)</span>}
                              </p>
                              <p className="text-sm text-muted-foreground">{memberData.email || 'No email available'}</p>
                              <div className="mt-1">
                                <Badge variant={member.role === 'owner' ? "default" : "outline"}>
                                  {member.role}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="projects">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                      <p className="text-muted-foreground mb-4">This team doesn't have any active projects.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle>Team Settings</CardTitle>
                    <CardDescription>
                      Manage your team settings and permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="dark:text-gray-300 mb-4">
                      Team settings can only be managed by team administrators.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                        <Button variant="destructive">Delete Team</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The team you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/teams">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  )
}