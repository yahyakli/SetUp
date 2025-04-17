"use client";

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Clock,
  CheckCircle2,
  Folder,
  Users,
  PlusCircle
} from 'lucide-react'
import AppLayout from '../AppLayout'
import Link from 'next/link'
import { RootState } from '@/lib/store'
import { useSelector } from 'react-redux'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import ClientSideWrapper from '@/components/ClientSideWrapper';
import { useAppContext } from '@/context/AppContext'

// This component uses useSearchParams and will be wrapped in Suspense
function DashboardContent() {
  const { projects, projectLoading } = useSelector((state: RootState) => state.projects);
  const { tasks, taskLoading } = useSelector((state: RootState) => state.tasks);
  const searchParams = useSearchParams();
  const paymentSuccess = searchParams?.get('payment_success');
  const planName = searchParams?.get('plan');
  const { userPermissions } = useAppContext();

  useEffect(() => {
    // Show success toast if redirected from successful payment
    if (paymentSuccess === 'true' && planName) {
      toast.success(
        `Your subscription to the ${planName} plan was successful!`,
        {
          duration: 3000,
          position: 'top-center',
          icon: '🎉',
        }
      );

      const url = new URL(window.location.href);
      url.searchParams.delete('payment_success');
      url.searchParams.delete('plan');
      window.history.replaceState({}, '', url.toString());
    }
  }, [paymentSuccess, planName]);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const getProjectById = (id: number) => {
    return projects.find((project) => project.id === id);
  }

  const sortedProjects = [...projects]
    .slice(0, userPermissions?.projects === -1 ? 4 : Math.min(4, userPermissions?.projects || 0));

  return (
    <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
      {/* Recent Projects Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Your Work</h2>

        {projectLoading ? (
          // Skeleton loader for projects
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          // Empty state for projects
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center py-10">
              <Folder className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You don&#39;t have any projects yet. Create your first project to get started.
              </p>
              <Link href="/projects/create">
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create New Project
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-all">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={
                          project.status === 'completed' ? 'default' :
                            project.status === 'active' ? 'secondary' : 'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{project.teams.map((team) => team.name).join(', ')}</div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        {project.end_date ? `Due: ${formatDate(project.end_date)}` : 'No due date'}
                      </span>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Separator className="my-4" />

      {/* My Tasks Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 dark:text-white">My Tasks</h2>

        {taskLoading ? (
          // Skeleton loader for tasks
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          // Empty state for tasks
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center text-center py-10">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tasks Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You don&#39;t have any tasks assigned to you yet.
              </p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-5">
            {tasks.map((task) => (
              <Link key={task._id} href={`/tasks/${task._id}`}>
                <Card className="hover:bg-secondary/20 transition-all">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="text-green-500 h-5 w-5" />
                      ) : (
                        <Clock className="text-yellow-500 h-5 w-5" />
                      )}
                      <div>
                        <div className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getProjectById(task.project_id)?.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          task.priority === 'High' ? 'destructive' :
                            task.priority === 'Medium' ? 'secondary' : 'outline'
                        }
                        className="whitespace-nowrap text-xs dark:border-slate-700"
                      >
                        {task.priority}
                      </Badge>
                      {task.label && (
                        <Badge variant="secondary" className="whitespace-nowrap text-xs dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">{task.label}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {task.due_date ? formatDate(task.due_date) : 'No due date'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <ClientSideWrapper>
        <DashboardContent />
      </ClientSideWrapper>
    </AppLayout>
  );
}

// Disable static generation for this page
export const dynamic = 'force-dynamic';