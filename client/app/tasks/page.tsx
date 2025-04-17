"use client"
import React, { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react'
import AppLayout from '../AppLayout'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useViewMode } from '@/hooks/useViewMode'

export default function Page() {

  const [searchTerm, setSearchTerm] = useState('')
  const { tasks, taskLoading } = useSelector((state: RootState) => state.tasks);
  const { projects } = useSelector((state: RootState) => state.projects);
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [priorityFilter, setPriorityFilter] = useState<string>('All')
  const [viewMode, setViewMode] = useViewMode('tasks', 'list')

  // Filtered and Searched Projects
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'All' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [searchTerm, statusFilter, priorityFilter, tasks]);

  // Add formatDate helper function
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

  // Add ProjectSkeleton component
  const ProjectSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => (
    viewMode === 'list' ? (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    ) : (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-grow pr-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  )

  return (
    <AppLayout>
      <div className="p-6 space-y-6 dark:bg-gray-900 bg-gray-50">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">Tasks</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tasks with Loading State */}
        {taskLoading ? (
          viewMode === 'list' ? (
            <div className="flex flex-col gap-4">
              {[...Array(8)].map((_, index) => (
                <ProjectSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <ProjectSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          )
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No tasks found matching your search and filters.
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col gap-4">
            {filteredTasks.map((task) => (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTasks.map((task) => (
              <Link key={task._id} href={`/tasks/${task._id}`}>
                <Card className="hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </h3>
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="text-green-500 h-5 w-5" />
                      ) : (
                        <Clock className="text-yellow-500 h-5 w-5" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getProjectById(task.project_id)?.name}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
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
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Due: {task.due_date ? formatDate(task.due_date) : 'No due date'}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

// Disable static generation for this page
export const dynamic = 'force-dynamic';