"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Users,
  Calendar,
  Settings,
  ClipboardList,
  UserPlus,
  Shield,
  CalendarIcon,
  ArrowUpRight
} from 'lucide-react'
import AppLayout from '../../AppLayout'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { PROJECT_SERVICE_URL, USERS_SERVICE_URL, TASK_SERVICE_URL } from '@/constants/API_URLS'
import { Team, TeamMember, User } from '@/types/index'
import UserAvatar from '@/components/UserAvatar'
import DeleteTeamModal from '@/components/DeleteTeamModal'
import InviteMembersModal from '@/components/InviteMembersModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { deleteTeamInState } from '@/lib/features/TeamsSlice'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Page() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const { user, token } = useSelector((state: RootState) => state.user)
  const [team, setTeam] = useState<Team | null>(null)
  const [usersData, setUsersData] = useState<Record<string, User>>({})
  const [isPending, setIsPending] = useState(true)
  
  // Get the current tab from URL or default to 'members'
  const activeTab = searchParams.get('tab') || 'members'
  
  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString())
    // Set the tab parameter
    params.set('tab', value)
    // Update the URL without refreshing the page
    router.push(`/teams/${id}?${params.toString()}`, { scroll: false })
  }
  
  const [teamOwner, setTeamOwner] = useState<string | undefined>('');
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number, user_id: string, name: string } | null>(null);

  const isTeamMember = team?.members.some(member => member.user_id === user?.id);

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

            // Fetch user data in batch instead of individual requests
            if (memberIds.length > 0) {
              const userRes = await axios.post(
                `${USERS_SERVICE_URL}/api/users/batch`,
                memberIds,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              
              if (userRes.status === 200) {
                // Create a map of userId -> fullUserData
                const userDataMap = userRes.data.reduce((acc: Record<string, User>, userData: User) => {
                  acc[userData.id] = userData;
                  return acc;
                }, {});
                
                setUsersData(userDataMap);
              }
            }
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

  useEffect(() => {
    const temp = team?.members.find(member => member.role === 'owner');
    setTeamOwner(temp?.user_id);
  }, [team]);

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

  // Unauthorized screen component
  const UnauthorizedScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Shield className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        You don&#39;t have permission to view this team&#39;s details. Only team members can access this page.
      </p>
      <Link href="/teams">
        <Button>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Button>
      </Link>
    </div>
  );

  const handleLeaveTeam = async () => {
    if (!team || !user) return;

    const teamMember = team.members.find(member => member.user_id === user.id);
    if (!teamMember) return;

    try {
      // First, remove the user's tasks
      const tasksRes = await axios.delete(TASK_SERVICE_URL + `/api/tasks/user/${user.id}/team/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Check if tasks were successfully deleted
      if (tasksRes.status !== 200) {
        toast.error('Failed to remove your tasks');
        return;
      }
      
      // Then remove the member from the team
      const res = await axios.delete(PROJECT_SERVICE_URL + `/api/team-members/${teamMember.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if(res.status === 200){
        dispatch(deleteTeamInState(team.id));
        toast.success('Successfully left the team and removed your tasks');
        router.push('/teams');
      }

    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message || 'Failed to leave team');
      } else {
        toast.error('Failed to leave team');
      }
    }
  };

  const handleRemoveMember = (member: TeamMember) => {
    const memberName = usersData[member.user_id]?.firstName && usersData[member.user_id]?.lastName
      ? `${usersData[member.user_id].firstName} ${usersData[member.user_id].lastName}`
      : 'this member';
    
    setMemberToRemove({
      id: member.id,
      user_id: member.user_id,
      name: memberName
    });
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !token) return;

    try {
      // First, remove the user's tasks
      const tasksRes = await axios.delete(TASK_SERVICE_URL + `/api/tasks/user/${memberToRemove.user_id}/team/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Check if tasks were successfully deleted
      if (tasksRes.status !== 200) {
        toast.error('Failed to remove member tasks');
        return;
      }
      
      // Then remove the member from the team
      const res = await axios.delete(PROJECT_SERVICE_URL + `/api/team-members/${memberToRemove.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        // Update local state to reflect the change
        if (team) {
          setTeam({
            ...team,
            members: team.members.filter(member => member.id !== memberToRemove.id)
          });
        }
        toast.success(`${memberToRemove.name} has been removed from the team and their tasks have been deleted`);
      }
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message || 'Failed to remove team member');
      } else {
        toast.error('Failed to remove team member');
      }
    } finally {
      setMemberToRemove(null);
    }
  };

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
          isTeamMember ? (
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
                        <p className="text-2xl font-bold">{team.created_at ? formatDate(team.created_at) : 'N/A'}</p>
                        <p className="text-muted-foreground">Created</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for Team Content - Updated to use URL state */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                  {user?.id === teamOwner && (
                    <div className="mb-6 flex justify-end">
                      <Button onClick={() => setShowInviteModal(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Members
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.members.map((member) => {
                      const memberData = usersData[member.user_id] || {};
                      const isCurrentUser = member.user_id === user?.id;
                      const isOwner = member.role === 'owner';

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
                            {/* Add remove button for team owner */}
                            {user?.id === teamOwner && !isOwner && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-destructive hover:bg-destructive/40 duration-200"
                                onClick={() => handleRemoveMember(member)}
                              >
                                Remove
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Invite Members Modal */}
                  {team && (
                    <InviteMembersModal
                      team={team}
                      isOpen={showInviteModal}
                      onClose={() => setShowInviteModal(false)}
                      token={token}
                      existingMembers={team.members.map(member => member.user_id)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="projects">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Team Projects</CardTitle>
                        <CardDescription>Projects this team is working on</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {team.projects && team.projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {team.projects.map((project) => (
                            <Card key={project.id} className="overflow-hidden dark:bg-gray-700 dark:border-gray-600 hover:shadow-md transition-shadow">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                  <CardTitle className="text-lg">{project.name}</CardTitle>
                                  <Badge variant={
                                    project.status === 'completed' ? 'default' :
                                    project.status === 'active' ? 'secondary' : 'outline'
                                  }>
                                    {project.status}
                                  </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                  {project.description || 'No description provided'}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                <div className="flex items-center text-sm text-muted-foreground mb-3">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  <span>
                                    {project.end_date ? 
                                      `Due ${format(new Date(project.end_date), 'MMM d, yyyy')}` : 
                                      'No due date'}
                                  </span>
                                </div>
                                <a href={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" className="w-full mt-2 flex items-center justify-center">
                                    <span>View Project</span>
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </a>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                          <p className="text-muted-foreground mb-4">This team doesn&#39;t have any active projects.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>


                <TabsContent value="settings">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle>Team Settings</CardTitle>
                      {user?.id === teamOwner && (
                        <CardDescription>
                          Manage your team settings and permissions
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Leave Team Section for non-owners */}
                        {isTeamMember && user?.id !== teamOwner && (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Leave Team</h3>
                            <p className="text-muted-foreground mb-4">
                              You will lose access to all team resources and projects.
                            </p>
                            <Button
                              variant="destructive"
                              onClick={() => setShowLeaveConfirmation(true)}
                            >
                              Leave Team
                            </Button>
                          </div>
                        )}

                        {/* Delete Team Section - only visible to owner */}
                        {user?.id === teamOwner && (
                          <div>
                            <h3 className="text-lg font-medium mb-2">Danger Zone</h3>
                            <p className="text-muted-foreground mb-4">
                              Once you delete a team, there is no going back.
                            </p>
                            <Button
                              onClick={() => setShowDeleteModal(true)}
                              variant="destructive"
                            >
                              Delete Team
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Leave Team Confirmation Dialog */}
                  {showLeaveConfirmation && (
                    <Dialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Leave Team</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to leave {team?.name}? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowLeaveConfirmation(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleLeaveTeam}
                          >
                            Leave Team
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  {/* Existing Delete Team Modal */}
                  {team && (
                    <DeleteTeamModal
                      teamId={id as string}
                      teamName={team.name}
                      isOpen={showDeleteModal}
                      onClose={() => setShowDeleteModal(false)}
                      token={token}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <UnauthorizedScreen />
          )
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Team Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The team you&#39;re looking for doesn&#39;t exist or you don&#39;t have permission to view it.
            </p>
            <Link href="/teams">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams
              </Button>
            </Link>
          </div>
        )}

        {/* Add the AlertDialog for member removal confirmation */}
        <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
          <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <AlertDialogHeader>
              <AlertDialogTitle className="dark:text-gray-100 text-xl">Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription className="dark:text-gray-300 text-gray-600">
                Are you sure you want to remove <span className="font-medium dark:text-gray-100 text-gray-900">{memberToRemove?.name}</span> from this team? 
                They will lose access to all team projects and resources.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 dark:border-gray-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmRemoveMember}
                className="bg-destructive text-white hover:bg-destructive/90 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}