"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import AppLayout from '../../../AppLayout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import axios from 'axios'
import { PROJECT_SERVICE_URL } from '@/constants/API_URLS'
import Link from 'next/link'
import { Attachment, TeamMember } from '@/types'

export default function CreateTaskPage() {
  const router = useRouter()
  const { id } = useParams()
  const { projects, projectLoading } = useSelector((state: RootState) => state.projects)
  const { user, token } = useSelector((state: RootState) => state.user)
  const project = projects.find(p => p.id === parseInt(id as string, 10))
  console.log(project);
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('todo')
  const [priority, setPriority] = useState('low')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [estimatedHours, setEstimatedHours] = useState('')
  const [label, setLabel] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update team members when selected team changes
  useEffect(() => {
    if (selectedTeam && project) {
      const team = project.teams.find(t => t.id === selectedTeam)
      if (team && team.members) {
        setTeamMembers(team.members)
      } else {
        setTeamMembers([])
      }
      // Reset assignee when team changes
      setAssigneeId(null)
    } else {
      setTeamMembers([])
    }
  }, [selectedTeam, project])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      } as Attachment))
      setAttachments([...attachments, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments]
    if (newAttachments[index].preview) {
      URL.revokeObjectURL(newAttachments[index].preview!)
    }
    newAttachments.splice(index, 1)
    setAttachments(newAttachments)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Task title is required')
      return
    }

    if (!project) {
      toast.error('Project not found')
      return
    }

    setIsSubmitting(true)

    try {
      // Create task data
      const taskData = {
        title,
        description: description || null,
        status,
        priority,
        project_id: project.id,
        assignee_id: assigneeId || null,
        creator_id: user?.id,
        due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        label: label || null,
      }

      // Create task
      const response = await axios.post(
        `${PROJECT_SERVICE_URL}/api/tasks`,
        taskData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.status === 201 && attachments.length > 0) {
        const taskId = response.data.id

        // Upload attachments if any
        const uploadPromises = attachments.map(async (attachment) => {
          if (!attachment.file) return null;
          
          const formData = new FormData()
          formData.append('file', attachment.file)
          formData.append('task_id', taskId)
          formData.append('attachment_type', attachment.file.type)
          formData.append('original_filename', attachment.file.name)
          formData.append('file_size', attachment.file.size.toString())

          return axios.post(
            `${PROJECT_SERVICE_URL}/api/tasks/${taskId}/attachments`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          )
        })

        await Promise.all(uploadPromises.filter(Boolean))
      }

      toast.success('Task created successfully')
      router.push(`/projects/${id}?tab=tasks`)
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading skeleton
  if (projectLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6 dark:bg-gray-900 bg-gray-50">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-[600px] w-full" />
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
            <h1 className="text-3xl font-bold text-muted-foreground">Project Not Found</h1>
            <p className="text-muted-foreground max-w-md">
              The project you&#39;re trying to create a task for doesn&#39;t exist or you may not have access to it.
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
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Create Task</h1>
          <p className="text-muted-foreground">
            Create a new task for project: <span className="font-medium">{project.name}</span>
          </p>
        </div>

        {/* Task Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>Enter the details for the new task</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="create-task-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task title"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task description"
                    rows={4}
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Due Date and Estimated Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="due-date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated-hours">Estimated Hours</Label>
                    <Input
                      id="estimated-hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      placeholder="Estimated hours to complete"
                    />
                  </div>
                </div>

                {/* Label */}
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Task label (e.g., 'Bug', 'Feature', 'Documentation')"
                  />
                </div>

                {/* Team and Assignee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team">Team</Label>
                    <Select 
                      value={selectedTeam?.toString() || ''} 
                      onValueChange={(value) => setSelectedTeam(parseInt(value, 10))}
                    >
                      <SelectTrigger id="team">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {project.teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select 
                      value={assigneeId || ''} 
                      onValueChange={setAssigneeId}
                      disabled={!selectedTeam || teamMembers.length === 0}
                    >
                      <SelectTrigger id="assignee">
                        <SelectValue placeholder={
                          !selectedTeam 
                            ? "Select a team first" 
                            : teamMembers.length === 0 
                              ? "No members in this team" 
                              : "Select team member"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            {member.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Attachments */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments</Label>
                    <div className="flex items-center gap-2">
                      <Label 
                        htmlFor="file-upload" 
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-input rounded-md hover:bg-accent"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Files</span>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {attachments.map((attachment, index) => (
                        <div 
                          key={index} 
                          className="relative border rounded-md p-2 flex items-center gap-2"
                        >
                          <div className="flex-1 truncate">
                            <p className="text-sm font-medium truncate">
                              {attachment.file?.name || attachment.original_filename || 'File'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.file 
                                ? `${(attachment.file.size / 1024).toFixed(2)} KB`
                                : attachment.file_size 
                                  ? `${(attachment.file_size / 1024).toFixed(2)} KB` 
                                  : 'Unknown size'
                              }
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/projects/${id}?tab=tasks`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="create-task-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  )
} 