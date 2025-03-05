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
import { Progress } from '@/components/ui/progress'
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

// Project Interface
interface Project {
  id: string
  name: string
  description: string
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed'
  progress: number
  startDate: string
  endDate: string
  team: string
}

// Fake Projects Data
const projectsData: Project[] = [
  {
    id: 'proj1',
    name: 'Customer Portal Redesign',
    description: 'Comprehensive redesign of customer-facing web application',
    status: 'In Progress',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-04-30',
    team: 'Design Team',
  },
  {
    id: 'proj2',
    name: 'Marketing Automation Platform',
    description: 'Building an integrated marketing communication system',
    status: 'Planning',
    progress: 25,
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    team: 'Marketing Team',
  },
  {
    id: 'proj3',
    name: 'Internal Communication App',
    description: 'Enterprise-grade communication and collaboration tool',
    status: 'In Progress',
    progress: 90,
    startDate: '2024-02-01',
    endDate: '2024-03-20',
    team: 'Engineering Team',
  },
  {
    id: 'proj4',
    name: 'Product Analytics Dashboard',
    description: 'Advanced analytics platform for product insights',
    status: 'Completed',
    progress: 100,
    startDate: '2024-01-01',
    endDate: '2024-02-28',
    team: 'Data Team',
  },
  {
    id: 'proj5',
    name: 'E-commerce Platform Upgrade',
    description: 'Upgrading existing e-commerce platform with new features',
    status: 'On Hold',
    progress: 40,
    startDate: '2024-02-15',
    endDate: '2024-05-15',
    team: 'Engineering Team',
  }
]

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'All'>('All')

  // Filtered and Searched Projects
  const filteredProjects = useMemo(() => {
    return projectsData.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'All' || project.status === statusFilter


      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

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
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
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
                            project.status === 'Planning' ? 'secondary' :
                              project.status === 'On Hold' ? 'destructive' : 'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <Progress value={project.progress} className="w-full" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {project.team}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {project.startDate}
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