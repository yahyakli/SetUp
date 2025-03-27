"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import AppLayout from '../../AppLayout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { PROJECT_SERVICE_URL, USERS_SERVICE_URL, TASK_SERVICE_URL } from '@/constants/API_URLS'
import Link from 'next/link'
import { Attachment, Comment, Task, User, Project, TeamMember } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
  Tag,
  UserCircle
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import AttachmentPreviewModal from '@/components/TaskAttachmentPreviewModal'

export default function TaskDetailPage() {
  const { id } = useParams()
  const { user, token } = useSelector((state: RootState) => state.user)

  const [task, setTask] = useState<Task | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [assignee, setAssignee] = useState<User | null>(null)
  const [creator, setCreator] = useState<User | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [commentUsers, setCommentUsers] = useState<Record<string, User>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [dataReady, setDataReady] = useState(false)

  // Fetch task data
  useEffect(() => {
    let isMounted = true;
    
    const fetchTaskData = async () => {
      if (!isMounted) return;
      
      setLoading(true)
      setError(null)
      setDataReady(false) // Reset data ready state
      
      try {
        // Fetch task details
        const taskResponse = await axios.get(
          `${TASK_SERVICE_URL}/api/tasks/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!isMounted) return;

        if (taskResponse.status === 200) {
          const taskData = taskResponse.data.data
          
          // Check if task data is empty or null
          if (!taskData) {
            setError('Task not found. The task may have been deleted or does not exist.')
            setLoading(false)
            return
          }
          
          // Store task data but don't set it to state yet
          const fetchedTask = taskData

          // Prepare data objects to set all at once
          let commentsData = [];
          let attachmentsData = [];
          let projectData = null;
          let isUserAuthorized = false;
          let commentUsersData = {};
          let assigneeData = null;
          let creatorData = null;

          // Process comments
          if (taskData.comments) {
            commentsData = taskData.comments;

            // Extract unique user IDs from comments
            const commentUserIds = [...new Set(taskData.comments.map((comment: Comment) => comment.user_id))]

            if (commentUserIds.length > 0) {
              try {
                const userResponse = await axios.post(
                  `${USERS_SERVICE_URL}/api/users/batch`,
                  commentUserIds,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }
                )
                
                if (!isMounted) return;

                if (userResponse.status === 200) {
                  const users = userResponse.data
                  const usersMap: Record<string, User> = {}

                  users.forEach((user: User) => {
                    usersMap[user.id] = user
                  })

                  commentUsersData = usersMap;
                }
              } catch (error) {
                console.error('Error fetching comment users:', error)
              }
            }
          }

          // Process attachments
          if (taskData.attachments) {
            attachmentsData = taskData.attachments;
          }

          // Fetch project details
          if (taskData.project_id) {
            try {
              const projectResponse = await axios.get(
                `${PROJECT_SERVICE_URL}/api/projects/${taskData.project_id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              )
              
              if (!isMounted) return;
              
              if (projectResponse.status === 200) {
                projectData = projectResponse.data;
                
                // Check authorization
                // User is authorized if they are the project owner
                if (user?.id === projectData.owner_id) {
                  isUserAuthorized = true;
                }
                
                // User is authorized if they are the task creator or assignee
                else if (user?.id === fetchedTask.creator_id || user?.id === fetchedTask.assignee_id) {
                  isUserAuthorized = true;
                }
                
                // Check if user is a member of any project teams
                else if (projectData.teams && projectData.teams.length > 0) {
                  for (const team of projectData.teams) {
                    // Check if the current user is a member of this team
                    if (team.members && team.members.some((member: TeamMember) => member.user_id === user?.id)) {
                      isUserAuthorized = true;
                      break;
                    }
                  }
                }
                
                if (!isUserAuthorized) {
                  setIsAuthorized(false);
                  setError('You do not have permission to view this task.');
                  setLoading(false);
                  return;
                }
              }
            } catch (error) {
              console.error('Error fetching project:', error)
              setError('Failed to load project data. Please try again later.')
              setLoading(false);
              return;
            }
          }

          // Fetch user details (assignee and creator)
          const userIds = []
          if (fetchedTask.assignee_id) userIds.push(fetchedTask.assignee_id)
          if (fetchedTask.creator_id) userIds.push(fetchedTask.creator_id)

          if (userIds.length > 0) {
            try {
              const userResponse = await axios.post(
                `${USERS_SERVICE_URL}/api/users/batch`,
                userIds,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              )

              if (!isMounted) return;

              if (userResponse.status === 200) {
                const users = userResponse.data

                if (fetchedTask.assignee_id) {
                  const foundAssignee = users.find((u: User) => u.id === fetchedTask.assignee_id)
                  if (foundAssignee) assigneeData = foundAssignee;
                }

                if (fetchedTask.creator_id) {
                  const foundCreator = users.find((u: User) => u.id === fetchedTask.creator_id)
                  if (foundCreator) creatorData = foundCreator;
                }
              }
            } catch (error) {
              console.error('Error fetching users:', error)
            }
          }

          // Set all state at once to avoid flickering
          if (isMounted) {
            setTask(fetchedTask);
            setComments(commentsData);
            setAttachments(attachmentsData);
            if (projectData) setProject(projectData);
            setCommentUsers(commentUsersData);
            if (assigneeData) setAssignee(assigneeData);
            if (creatorData) setCreator(creatorData);
            setIsAuthorized(true);
            setDataReady(true);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error fetching task:', error)
        if (error instanceof AxiosError && error.response && error.response.status === 404) {
          setError('Task not found. The task may have been deleted or does not exist.')
        } else {
          setError('Failed to load task data. Please try again later.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (token && id) {
      fetchTaskData()
    } else {
      setLoading(false)
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [id, token, user?.id])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    if (!task?._id || !user?.id) {
      toast.error('Unable to add comment')
      return
    }

    setSubmittingComment(true)

    try {
      const response = await axios.post(
        `${TASK_SERVICE_URL}/api/comments/`,
        {
          task_id: task._id,
          user_id: user.id,
          content: newComment,
          status: 'active'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.status === 201) {
        // Add the new comment to the list
        const newCommentData = response.data.data
        setComments([...comments, newCommentData])

        // Add the current user to comment users if not already there
        if (!commentUsers[user.id]) {
          setCommentUsers({
            ...commentUsers,
            [user.id]: user
          })
        }

        // Clear the comment input
        setNewComment('')
        toast.success('Comment added successfully')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Not set'
    return format(new Date(dateString), 'MMM d, yyyy')
  }

  const formatDateTime = (dateString: string | Date) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  }

  const getStatusBadgeVariant = (status: string | undefined): "outline" | "secondary" | "default" | "destructive" | null | undefined => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'todo':
        return 'outline'
      case 'in_progress':
        return 'secondary'
      case 'review':
        return 'default'
      case 'completed':
        return 'default'
      default:
        return 'outline'
    }
  }

  const getPriorityBadgeVariant = (priority: string): "outline" | "secondary" | "default" | "destructive" | null | undefined => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'outline'
      case 'medium':
        return 'secondary'
      case 'high':
        return 'default'
      case 'urgent':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handlePreviewAttachment = (attachment: Attachment) => {
    setPreviewAttachment(attachment)
    setIsPreviewOpen(true)
  }

  // Loading skeleton
  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 dark:bg-gray-900 bg-gray-50">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2">
              <Skeleton className="h-[400px] w-full" />
            </div>
            <div>
              <Skeleton className="h-[400px] w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Task not found or error state - show this after loading is completed
  if (error || !dataReady || isAuthorized === false) {
    return (
      <AppLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[50vh] dark:bg-gray-900 bg-gray-50">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-3xl font-bold text-muted-foreground">
              {isAuthorized === false ? "Access Denied" : "Task Not Found"}
            </h1>
            <p className="text-muted-foreground max-w-md">
              {error || "The task you're looking for doesn't exist or you may not have access to it."}
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
        {/* Header with breadcrumb */}
        <div className="space-y-2">
          {project && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Link href="/projects" className="hover:text-primary">
                Projects
              </Link>
              <span className="mx-2">/</span>
              <Link href={`/projects/${project.id}`} className="hover:text-primary">
                {project.name}
              </Link>
              <span className="mx-2">/</span>
              <span>Task</span>
            </div>
          )}
          <h1 className="text-3xl font-bold dark:text-white">{task?.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={getStatusBadgeVariant(task?.status)}>
              {task?.status === 'todo' ? 'To Do' :
                task?.status === 'in_progress' ? 'In Progress' :
                  task?.status ? task?.status?.charAt(0).toUpperCase() + task?.status?.slice(1) : null}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(task?.priority || '')}>
              {task?.priority ? task?.priority?.charAt(0).toUpperCase() + task?.priority?.slice(1) : null} Priority
            </Badge>
            {task?.label && (
              <Badge variant="secondary">
                {task?.label?.charAt(0).toUpperCase() + task?.label?.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Task details and tabs */}
          <div className="md:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  Attachments ({attachments.length})
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {task?.description ? (
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{task?.description}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No description provided.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Task Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Created</h4>
                        <p className="text-sm text-muted-foreground">
                          {task?.created_at ? formatDateTime(task?.created_at) : 'Unknown'}
                          {creator && ` by ${creator.firstName} ${creator.lastName}`}
                        </p>
                      </div>
                    </div>

                    {task?.updated_at && task?.updated_at !== task?.created_at && (
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Last Updated</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(task.updated_at)}
                          </p>
                        </div>
                      </div>
                    )}

                    {task?.due_date && (
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Due Date</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(task.due_date)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                    <CardDescription>
                      Discuss this task with your team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {comments.length > 0 ? (
                      <div className="space-y-6">
                        {comments.map((comment) => {
                          const commentUser = commentUsers[comment.user_id]
                          const initials = commentUser ?
                            `${commentUser.firstName?.[0] || ''}${commentUser.lastName?.[0] || ''}` :
                            comment.user_id.substring(0, 2)

                          return (
                            <div key={comment._id} className="flex gap-4">
                              <Avatar className="w-10 h-10">
                                {commentUser?.avatar ? (
                                  <AvatarImage
                                    src={USERS_SERVICE_URL + commentUser.avatar}
                                    alt={commentUser?.firstName || 'User'}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {initials}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {commentUser ?
                                      `${commentUser.firstName} ${commentUser.lastName}` :
                                      'Unknown User'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {comment.created_at ?
                                      formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) :
                                      'Unknown time'}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  {comment.content}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-1">No comments yet</h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                          Be the first to comment on this task.
                        </p>
                      </div>
                    )}

                    {/* Add comment form */}
                    <form onSubmit={handleSubmitComment} className="pt-4">
                      <div className="flex gap-4">
                        <Avatar className="w-10 h-10">
                          {user?.avatar ? (
                            <AvatarImage
                              src={USERS_SERVICE_URL + user.avatar}
                              alt={user?.firstName || 'User'}
                            />
                          ) : (
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user?.firstName?.[0] || ''}{user?.lastName?.[0] || ''}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              disabled={submittingComment || !newComment.trim()}
                            >
                              {submittingComment ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Post Comment
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                    <CardDescription>
                      Files attached to this task
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {attachments.length > 0 ? (
                      <div className="space-y-4">
                        {attachments.map((attachment) => (
                          <div
                            key={attachment._id}
                            className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 cursor-pointer"
                            onClick={() => handlePreviewAttachment(attachment)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {attachment.original_filename || 'File'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {attachment.file_size
                                    ? `${(attachment.file_size / 1024).toFixed(2)} KB`
                                    : 'Unknown size'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Paperclip className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-1">No attachments</h3>
                        <p className="text-muted-foreground text-sm max-w-md">
                          There are no files attached to this task.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Task metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignee */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Assignee</h4>
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {assignee.avatar ? (
                          <AvatarImage
                            src={USERS_SERVICE_URL + assignee.avatar}
                            alt={assignee.firstName || 'User'}
                          />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {assignee.firstName?.[0] || ''}{assignee.lastName?.[0] || ''}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{assignee.firstName} {assignee.lastName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserCircle className="h-5 w-5" />
                      <span>Not assigned</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Status */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Status</h4>
                  <Badge variant={getStatusBadgeVariant(task?.status)} className="text-xs">
                    {task?.status === 'todo' ? 'To Do' :
                      task?.status === 'in_progress' ? 'In Progress' :
                        task?.status ? task?.status?.charAt(0).toUpperCase() + task?.status?.slice(1) : null}
                  </Badge>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Priority</h4>
                  <Badge variant={getPriorityBadgeVariant(task?.priority || '')} className="text-xs">
                    {task?.priority ? task?.priority?.charAt(0).toUpperCase() + task?.priority?.slice(1) : null}
                  </Badge>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Due Date</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{task?.due_date ? formatDate(task?.due_date) : 'Not set'}</span>
                  </div>
                </div>

                {/* Estimated Hours */}
                {task?.estimated_hours && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Estimated Hours</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{task.estimated_hours} hours</span>
                    </div>
                  </div>
                )}

                {/* Label */}
                {task?.label && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Label</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span>{task.label.charAt(0).toUpperCase() + task.label.slice(1)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {project && (
                  <Button variant="outline" asChild>
                    <Link href={`/projects/${project.id}?tab=tasks`}>
                      Back to Project
                    </Link>
                  </Button>
                )}
                {/* Only show edit button if user is project owner or task creator */}
                {(user?.id === project?.owner_id || user?.id === task?.creator_id) && (
                  <Button asChild>
                    <Link href={`/tasks/edit/${task?._id}`}>
                      Edit Task
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* Project Info */}
            {project && (
              <Card>
                <CardHeader>
                  <CardTitle>Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-primary hover:underline"
                  >
                    {project.name}
                  </Link>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <AttachmentPreviewModal
        attachment={previewAttachment}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </AppLayout>
  )
}
