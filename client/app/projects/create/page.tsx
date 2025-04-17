"use client"

import React, { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/app/AppLayout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import axios, { AxiosError } from 'axios'
import { PROJECT_SERVICE_URL } from '@/constants/API_URLS'
import { cn } from '@/lib/utils'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { addProject } from '@/lib/features/ProjectsSlice'
import { useAppContext } from '@/context/AppContext'
import Link from 'next/link'
import Loader from '@/components/Loader'

function CreateProjectPageContent() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.user);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { userPermissions } = useAppContext();
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  })
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Check if user has project creation permission
  const hasProjectsPermission = userPermissions?.projects === -1 ||
    ((userPermissions?.projects ?? 0) > projects.length);

  // If user doesn't have permission, show restricted access message
  if (!hasProjectsPermission) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="bg-muted/30 p-12 rounded-lg max-w-md flex flex-col items-center">
            <Lock className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Project Creation Restricted</h2>
            <p className="text-muted-foreground mb-6">
              Creating projects is not available in your current plan. Upgrade to a premium plan to unlock this feature and enhance your team collaboration.
            </p>
            <Button asChild>
              <Link href="/plans">Upgrade Your Plan</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if end date is after or equal to start date
    if (endDate < startDate) {
      toast.error('End date must be after or equal to start date')
      return
    }

    setIsLoading(true)

    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        status: formData.status,
        owner_id: user?.id
      }

      const res = await axios.post(`${PROJECT_SERVICE_URL}/api/projects`, projectData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 201) {
        dispatch(addProject(res.data.project));
        toast.success('Project created successfully')
        router.push('/projects')
      } else {
        toast.error("Server Error");
      }
    } catch (error) {
      console.error('Error creating project:', error)
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || 'Failed to create project'
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create New Project</CardTitle>
              <CardDescription>
                Fill in the details to create a new project
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength={255}
                  />
                </div>

                {/* Project Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter project description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="min-h-32"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label>Start Date <span className="text-destructive">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label>End Date <span className="text-destructive">*</span></Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date: Date) => date < (startDate || new Date())}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Project Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status <span className="text-destructive">*</span></Label>
                  <Select
                    defaultValue="active"
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
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
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading || !formData.name || !formData.description || !startDate || !endDate}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

// This component uses useSearchParams and will be wrapped in Suspense
export default function CreateProjectPage() {
  return (
    <Suspense fallback={<Loader />}>
      <CreateProjectPageContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
