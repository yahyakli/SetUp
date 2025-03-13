"use client"
import React, { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
  Folder,
  Search,
  Filter,
  Users,
  Calendar
} from 'lucide-react'
import AppLayout from '../AppLayout'
import Link from 'next/link'
import { Project } from '@/types'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'


export default function Page() {

  const [searchTerm, setSearchTerm] = useState('')
  const { projects, projectLoading } = useSelector((state: RootState) => state.projects)
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'All'>('All')

  // Filtered and Searched Projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())  

      const matchesStatus = statusFilter === 'All' || project.status === statusFilter


      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter, projects]);

  // Add formatDate helper function
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Add ProjectSkeleton component
  const ProjectSkeleton = () => (
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6 dark:bg-gray-900 bg-gray-50">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white">Projects</h1>
        </div>

        {/* Filters and Search */}
        <div className="flex space-x-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as Project['status'] | 'All')}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid with Loading State */}
        {projectLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            No projects found matching your search and filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card
                  className="hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex-grow pr-4">
                      <CardTitle className="text-lg font-bold truncate">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <Folder className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge
                        variant={
                          project.status === 'Completed' ? 'default' :
                            project.status === 'active' ? 'secondary' : 'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {project.teams.length > 0 
                          ? project.teams.map(team => team.name).join(', ')
                          : 'No teams'
                        }
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {project.start_date ? formatDate(project.start_date) : 'No date'}
                      </div>
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