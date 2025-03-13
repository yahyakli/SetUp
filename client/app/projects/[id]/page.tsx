"use client"
import React from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
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
  Info
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectPage() {
  const { id } = useParams()
  const { projects, projectLoading } = useSelector((state: RootState) => state.projects)
  const project = projects.find(p => p.id === parseInt(id as string, 10))

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
              <a 
                href="/projects" 
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Return to Projects
              </a>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
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

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
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
              <CardHeader>
                <CardTitle>Project Teams</CardTitle>
                <CardDescription>Teams working on this project</CardDescription>
              </CardHeader>
              <CardContent>
                {project.teams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No teams assigned to this project yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.teams.map((team) => (
                      <Card key={team.id} className="dark:bg-gray-800">
                        <CardHeader>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription>{team.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Project Tasks</CardTitle>
                <CardDescription>Manage project tasks and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Task management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>Manage project configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">
                  Project settings coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
} 