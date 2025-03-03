import React from 'react';
import { Bell, Calendar, MessageSquare, User, Settings, Moon, Sun, Search, Home, Briefcase, Users, BarChart2, Clock, AlignLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '../AppLayout';

// Type definitions
interface TeamMember {
  id: number;
  name: string;
  image: string | null;
  initials: string;
}

interface Project {
  id: number;
  name: string;
  status: 'In Progress' | 'On Hold' | 'Completed';
  progress: number;
  dueDate: string;
  team: TeamMember[];
}

interface Team {
  id: number;
  name: string;
  members: number;
  totalProjects: number;
}

interface ChatRoom {
  id: number;
  name: string;
  unread: number;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  item: string;
  time: string;
}

const Page: React.FC = () => {
  // You would fetch this data from your API in a real implementation
  const projects: Project[] = [
    {
      id: 1,
      name: 'Website Redesign',
      status: 'In Progress',
      progress: 65,
      dueDate: 'Mar 15, 2025',
      team: [
        { id: 1, name: 'Alex P', image: null, initials: 'AP' },
        { id: 2, name: 'Maria S', image: null, initials: 'MS' },
        { id: 3, name: 'John D', image: null, initials: 'JD' },
      ]
    },
    {
      id: 2,
      name: 'Mobile App Development',
      status: 'On Hold',
      progress: 30,
      dueDate: 'Apr 10, 2025',
      team: [
        { id: 2, name: 'Maria S', image: null, initials: 'MS' },
        { id: 4, name: 'Sam K', image: null, initials: 'SK' },
      ]
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      status: 'Completed',
      progress: 100,
      dueDate: 'Feb 28, 2025',
      team: [
        { id: 1, name: 'Alex P', image: null, initials: 'AP' },
        { id: 3, name: 'John D', image: null, initials: 'JD' },
        { id: 5, name: 'Emma R', image: null, initials: 'ER' },
      ]
    },
  ];

  const teams: Team[] = [
    { id: 1, name: 'Design Team', members: 5, totalProjects: 8 },
    { id: 2, name: 'Development Team', members: 7, totalProjects: 12 },
    { id: 3, name: 'Marketing Team', members: 4, totalProjects: 6 },
  ];

  const chatRooms: ChatRoom[] = [
    { id: 1, name: 'General', unread: 3 },
    { id: 2, name: 'Website Redesign', unread: 0 },
    { id: 3, name: 'Mobile App', unread: 5 },
  ];

  const recentActivity: Activity[] = [
    { id: 1, user: 'Maria S', action: 'completed task', item: 'Design Homepage', time: '2 hours ago' },
    { id: 2, user: 'John D', action: 'commented on', item: 'API Documentation', time: '4 hours ago' },
    { id: 3, user: 'Alex P', action: 'created project', item: 'SEO Optimization', time: '1 day ago' },
  ];

  const getStatusColor = (status: Project['status']): string => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500 dark:bg-green-600';
      case 'In Progress':
        return 'bg-blue-500 dark:bg-blue-600';
      case 'On Hold':
        return 'bg-amber-500 dark:bg-amber-600';
      default:
        return 'bg-slate-500 dark:bg-slate-600';
    }
  };

  // const getProgressColor = (progress: number): string => {
  //   if (progress === 100) return 'bg-green-500 dark:bg-green-600';
  //   if (progress > 50) return 'bg-blue-500 dark:bg-blue-600';
  //   return 'bg-amber-500 dark:bg-amber-600';
  // };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
        {/* Sidebar and Main Content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex-1 px-3 space-y-1">
                  <a href="#" className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                    <Home className="mr-3 h-6 w-6" />
                    Dashboard
                  </a>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                    <Briefcase className="mr-3 h-6 w-6" />
                    Projects
                  </a>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                    <Users className="mr-3 h-6 w-6" />
                    Teams
                  </a>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                    <MessageSquare className="mr-3 h-6 w-6" />
                    Messages
                  </a>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                    <Calendar className="mr-3 h-6 w-6" />
                    Calendar
                  </a>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                    <BarChart2 className="mr-3 h-6 w-6" />
                    Reports
                  </a>
                  <a href="#" className="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                    <Settings className="mr-3 h-6 w-6" />
                    Settings
                  </a>
                </div>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarFallback>YN</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Your Name</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Product Manager</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400">Welcome back, Your Name!</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">12</div>
                  <p className="text-xs text-green-500">+2 this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">8</div>
                  <p className="text-xs text-amber-500">3 due this week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">16</div>
                  <p className="text-xs text-green-500">+3 new members</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">68%</div>
                  <Progress className="h-2 mt-2" value={68} />
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="projects" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="teams">Teams</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-4">
                {projects.map(project => (
                  <Card key={project.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{project.name}</CardTitle>
                          <CardDescription>Due: {project.dueDate}</CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(project.status)}`}>{project.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                        <Progress className="h-2" value={project.progress} />
                      </div>
                      <div className="flex items-center mt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Team:</span>
                        <div className="flex -space-x-2">
                          {project.team.map(member => (
                            <Avatar key={member.id} className="border-2 border-white dark:border-gray-800">
                              {member.image ? <AvatarImage src={member.image} /> : null}
                              <AvatarFallback>{member.initials}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <AlignLeft className="mr-2 h-4 w-4" />
                        Details
                      </Button>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Clock className="mr-2 h-4 w-4" />
                          Timeline
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Chat
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>

              {/* Teams Tab */}
              <TabsContent value="teams" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teams.map(team => (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle>{team.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Members:</span>
                        <span className="font-medium">{team.members}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Projects:</span>
                        <span className="font-medium">{team.totalProjects}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <Users className="mr-2 h-4 w-4" />
                        View Team
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-4">
                {chatRooms.map(chat => (
                  <Card key={chat.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{chat.name}</CardTitle>
                        {chat.unread > 0 && (
                          <Badge className="bg-red-500">{chat.unread}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Open Chat
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-start">
                          <div className="mr-4">
                            <Avatar>
                              <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.item}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Page;