import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Clock, 
  CheckCircle2, 
  Folder, 
  Users 
} from 'lucide-react'
import AppLayout from '../AppLayout'

// Fake Data Interfaces
interface Project {
  id: string
  name: string
  progress: number
  team: string
  status: 'In Progress' | 'Completed' | 'On Hold'
  dueDate: string
}

interface Task {
  id: string
  title: string
  project: string
  priority: 'Low' | 'Medium' | 'High'
  dueDate: string
  completed: boolean
}

// Fake Data
const recentProjects: Project[] = [
  {
    id: 'proj1',
    name: 'Customer Portal Redesign',
    progress: 65,
    team: 'Design Team',
    status: 'In Progress',
    dueDate: '2024-04-30'
  },
  {
    id: 'proj2',
    name: 'Marketing Automation',
    progress: 45,
    team: 'Marketing Tech',
    status: 'In Progress',
    dueDate: '2024-05-15'
  },
  {
    id: 'proj3',
    name: 'Internal Communication App',
    progress: 90,
    team: 'Engineering',
    status: 'In Progress',
    dueDate: '2024-03-20'
  },
  {
    id: 'proj4',
    name: 'Product Analytics Dashboard',
    progress: 100,
    team: 'Data Team',
    status: 'Completed',
    dueDate: '2024-02-28'
  }
]

const myTasks: Task[] = [
  {
    id: 'task1',
    title: 'Design User Flow for New Feature',
    project: 'Customer Portal Redesign',
    priority: 'High',
    dueDate: '2024-03-10',
    completed: false
  },
  {
    id: 'task2',
    title: 'Implement Authentication Module',
    project: 'Marketing Automation',
    priority: 'Medium',
    dueDate: '2024-03-15',
    completed: false
  },
  {
    id: 'task3',
    title: 'Finalize API Documentation',
    project: 'Internal Communication App',
    priority: 'Low',
    dueDate: '2024-03-25',
    completed: true
  }
]

export default function Page() {
  return (
    <AppLayout>
      <div className="p-6 space-y-8 dark:bg-gray-900 bg-gray-50">
        {/* Recent Projects Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Your Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                  <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant={
                        project.status === 'Completed' ? 'default' : 
                        project.status === 'On Hold' ? 'destructive' : 'secondary'
                      }
                    >
                      {project.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{project.team}</div>
                  </div>
                  <Progress value={project.progress} className="w-full" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      Due: {project.dueDate}
                    </span>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-4" />

        {/* My Tasks Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">My Tasks</h2>
          <div className="space-y-3">
            {myTasks.map((task) => (
              <Card key={task.id} className="hover:bg-secondary/20 transition-all">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    {task.completed ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : (
                      <Clock className="text-yellow-500 h-5 w-5" />
                    )}
                    <div>
                      <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {task.project}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        task.priority === 'High' ? 'destructive' : 
                        task.priority === 'Medium' ? 'secondary' : 'outline'
                      }
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {task.dueDate}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}