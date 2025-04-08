"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import AppLayout from '../../AppLayout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Users,
  Settings,
  CheckSquare,
  Info,
  Plus,
  X,
  MessageSquare
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import AssignTeamsModal from '@/components/AssignTeamsModal'
import DeleteProjectDialog from '@/components/DeleteProjectDialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from 'axios'
import { PROJECT_SERVICE_URL } from '@/constants/API_URLS'
import { toast } from 'sonner'
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { updateProject } from '@/lib/features/ProjectsSlice'
import RemoveTeamModal from '@/components/RemoveTeamModal'
import Link from 'next/link'
import ProjectTasksTab from '@/components/ProjectTasksTab'
import ProjectChatTab from '@/components/ProjectChatTab'

export default function ProjectPage() {
  const dispatch = useDispatch()
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projects, projectLoading } = useSelector((state: RootState) => state.projects);
  const { user, token } = useSelector((state: RootState) => state.user);
  const project = projects.find(p => p.id === parseInt(id as string, 10))
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [updatePending, setUpdatePending] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [teamToRemove, setTeamToRemove] = useState<{ id: number, name: string } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  
  // Get the current tab from URL or default to 'info'
  const currentTab = searchParams.get('tab') || 'info'

  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString())
    // Set the tab parameter
    params.set('tab', value)
    // Update the URL without refreshing the page
    router.push(`/projects/${id}?${params.toString()}`, { scroll: false })
  }

  // Update selectedDate when project data changes
  useEffect(() => {
    if (project?.end_date) {
      setSelectedDate(new Date(project.end_date));
    }
  }, [project]);

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Add this function to generate verification code
  const generateVerificationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789'
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  // Loading skeleton
  if (projectLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 dark:bg-gray-900 bg-gray-50">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    )
  }

  // Project not found
  if (!project) {
    return (
      <AppLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] dark:bg-gray-900 bg-gray-50">
          <div className="text-center space-y-4">
            <Info className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-3xl font-bold text-muted-foreground">Project Not Found</h1>
            <p className="text-muted-foreground max-w-md">
              The project you&#39;re looking for doesn&#39;t exist or you may not have access to it.
            </p>
            <div className="pt-4">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Return to Projects
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 dark:bg-gray-900 bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center gap-18">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">{project.name}</h1>
            <p className="mt-5 text-muted-foreground">{project.description}</p>
          </div>
          <Badge
            variant={
              project.status === 'completed' ? 'default' :
                project.status === 'active' ? 'secondary' : 'outline'
            }
          >
            {project.status}
          </Badge>
        </div>

        {/* Tabs - Updated to include chat tab */}
        <Tabs value={currentTab} className="space-y-6" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Info
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Overview of the project details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-muted-foreground">Start Date</h3>
                    <p>{project.start_date ? formatDate(project.start_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">End Date</h3>
                    <p>{project.end_date ? formatDate(project.end_date) : 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Teams</h3>
                    <p>{project.teams.length} assigned teams</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">Status</h3>
                    <p className="capitalize">{project.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Teams</CardTitle>
                  <CardDescription>Teams working on this project</CardDescription>
                </div>
                {project.owner_id === user?.id && (
                  <Button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Teams
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {project.teams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No teams assigned to this project yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.teams.map((team) => (
                      <Card key={team.id} className="dark:bg-gray-800 group relative">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-lg">{team.name}</CardTitle>
                              <CardDescription className="line-clamp-3 pr-5 min-h-[2.5rem]">{team.description}</CardDescription>
                            </div>
                            {project.owner_id === user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setTeamToRemove({ id: team.id, name: team.name })
                                  setVerificationCode(generateVerificationCode())
                                }}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <AssignTeamsModal
              isOpen={showAssignModal}
              onClose={() => setShowAssignModal(false)}
              projectId={project.id}
            />
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Project Tasks</CardTitle>
                <CardDescription>Manage project tasks and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectTasksTab project={project} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <ProjectChatTab project={project} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            {project.owner_id === user?.id ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Settings</CardTitle>
                    <CardDescription>Update project details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={async (e) => {
                      e.preventDefault()
                      setUpdatePending(true)
                      const formData = new FormData(e.currentTarget)
                      const data = {
                        name: formData.get('name'),
                        description: formData.get('description'),
                        end_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
                        status: formData.get('status'),
                      }

                      try {
                        const res = await axios.put(
                          `${PROJECT_SERVICE_URL}/api/projects/${project.id}`,
                          data,
                          {
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          }
                        )
                        if (res.status === 200) {
                          dispatch(updateProject(res.data))
                          toast.success('Project updated successfully')
                        }
                      } catch (error) {
                        toast.error('Failed to update project')
                        console.error('Error updating project:', error)
                      } finally {
                        setUpdatePending(false)
                      }
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Project Name</label>
                        <Input
                          name="name"
                          defaultValue={project.name}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          name="description"
                          defaultValue={project.description}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? (
                                format(selectedDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <input 
                          type="hidden" 
                          name="end_date" 
                          value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ''} 
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select name="status" defaultValue={project.status}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" className="w-full" disabled={updatePending}>
                        {updatePending ? "Updating..." : "Update Project"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete Project
                    </Button>
                  </CardContent>
                </Card>

                <DeleteProjectDialog
                  isOpen={showDeleteDialog}
                  onClose={() => setShowDeleteDialog(false)}
                  projectId={project.id}
                  token={token}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-center">
                    Only the project owner can access settings
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <RemoveTeamModal
          isOpen={teamToRemove !== null}
          onClose={() => setTeamToRemove(null)}
          projectId={project.id}
          teamId={teamToRemove?.id || 0}
          teamName={teamToRemove?.name || ''}
          token={token}
          verificationCode={verificationCode}
        />
      </div>
    </AppLayout>
  )
} 