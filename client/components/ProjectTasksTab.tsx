import { TASK_SERVICE_URL, USERS_SERVICE_URL } from '@/constants/API_URLS';
import { RootState } from '@/lib/store';
import { Project, Task, User } from '@/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Plus, AlertCircle, CalendarClock, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProjectTasksTab({ project }: { project: Project }) {
  const { token, user } = useSelector((state: RootState) => state.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [usersData, setUsersData] = useState<Record<string, User>>({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${TASK_SERVICE_URL}/api/tasks/project/${project.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.status === 200) {
          setTasks(res.data.data);
          
          // Extract unique assignee IDs from tasks
          const assigneeIds: string[] = res.data.data
            .filter((task: Task) => task.assignee_id)
            .map((task: Task) => task.assignee_id);
          
          // Remove duplicates
          const uniqueAssigneeIds: string[] = [...new Set(assigneeIds)];
          
          // Fetch user data if there are assignees
          if (uniqueAssigneeIds.length > 0) {
            fetchUserData(uniqueAssigneeIds);
          }
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async (userIds: string[]) => {
      try {
        const userRes = await axios.post(
          `${USERS_SERVICE_URL}/api/users/batch`,
          userIds,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (userRes.status === 200) {
          const userDataMap = userRes.data.reduce((acc: Record<string, User>, userData: User) => {
            acc[userData.id] = userData;
            return acc;
          }, {});
          
          setUsersData(userDataMap);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    if (token && project.id) {
      fetchTasks();
    }
  }, [project.id, token]);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'No due date';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const completedTasks = tasks.length > 0 ? tasks.filter(task => task.status === 'completed') : [];
  const pendingTasks = tasks.length > 0 ? tasks.filter(task => task.status !== 'completed') : [];

  const filteredTasks = activeTab === 'all'
    ? tasks
    : activeTab === 'completed'
      ? completedTasks
      : pendingTasks;

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/50 dark:bg-slate-900/60 dark:border-destructive/30">
        <div className="flex flex-col items-center justify-center text-center py-10">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2 dark:text-slate-200">Something went wrong</h3>
          <p className="text-muted-foreground dark:text-slate-400 mb-6 max-w-md">
            {error}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Tasks ({tasks.length > 0 ? tasks.length : 0})</h3>
        </div>
        {user?.id === project.owner_id && (
          <Link href={`/tasks/create/${project.id}`}>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tasks ({tasks.length > 0 ? tasks.length : 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-0 mt-0">
          {renderTaskList(filteredTasks, project, formatDate, usersData)}
        </TabsContent>

        <TabsContent value="pending" className="space-y-0 mt-0">
          {renderTaskList(filteredTasks, project, formatDate, usersData)}
        </TabsContent>

        <TabsContent value="completed" className="space-y-0 mt-0">
          {renderTaskList(filteredTasks, project, formatDate, usersData)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderTaskList(
  tasks: Task[], 
  project: Project | undefined, 
  formatDate: (date: string | Date) => string,
  usersData: Record<string, User>
) {
  if (tasks.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30 dark:bg-muted/10 dark:border-muted/30">
        <CardContent className="flex flex-col items-center justify-center text-center py-10">
          <div className="bg-muted/50 dark:bg-muted/20 p-3 rounded-full mb-3">
            <CalendarClock className="h-8 w-8 text-muted-foreground dark:text-muted-foreground/80" />
          </div>
          <h4 className="text-base font-medium mb-2 dark:text-slate-200">No tasks in this category</h4>
          <p className="text-sm text-muted-foreground dark:text-slate-400 max-w-md">
            Try switching to a different tab or create a new task to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 flex flex-col gap-3">
      {tasks.length > 0 ? tasks.map((task) => {
        const assignee = task.assignee_id ? usersData[task.assignee_id] : null;
        
        return (
          <Link key={task._id} href={`/tasks/${task._id}`}>
            <Card className="hover:bg-secondary/20 dark:hover:bg-secondary/10 transition-all border-l-4 border-l-transparent hover:border-l-primary dark:bg-slate-900/60">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="text-green-500 dark:text-green-400 h-5 w-5 flex-shrink-0" />
                  ) : (
                    <Clock className="text-amber-500 dark:text-amber-300 h-5 w-5 flex-shrink-0" />
                  )}
                  <div>
                    <div className={`font-medium dark:text-slate-200 ${task.status === 'completed' ? 'line-through text-muted-foreground dark:text-slate-500' : ''}`}>
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground dark:text-slate-400 line-clamp-1 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  {task.assignee_id && (
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 border dark:border-slate-700">
                        <AvatarImage src={USERS_SERVICE_URL ? (USERS_SERVICE_URL + assignee?.avatar) : ''} />
                        <AvatarFallback className="text-xs dark:bg-slate-800 dark:text-slate-300">
                          {assignee ? 
                            `${assignee.firstName?.charAt(0) || ''}${assignee.lastName?.charAt(0) || ''}` : 
                            <UserCircle className="h-3 w-3" />
                          }
                        </AvatarFallback>
                      </Avatar>
                      {assignee && (
                        <span className="text-xs ml-2 text-muted-foreground dark:text-slate-400 hidden sm:inline">
                          {assignee.firstName} {assignee.lastName}
                        </span>
                      )}
                    </div>
                  )}
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
                  <span className="text-xs text-muted-foreground dark:text-slate-400 whitespace-nowrap">
                    {task.due_date ? formatDate(task.due_date) : 'No due date'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      }) : (
        <Card className="border-dashed bg-muted/30 dark:bg-muted/10 dark:border-muted/30">
          <CardContent className="flex flex-col items-center justify-center text-center py-8">
            <div className="bg-muted/50 dark:bg-muted/20 p-3 rounded-full mb-3">
              <AlertCircle className="h-7 w-7 text-amber-500 dark:text-amber-400" />
            </div>
            <h4 className="text-base font-medium mb-2 dark:text-slate-200">No matching tasks</h4>
            <p className="text-sm text-muted-foreground dark:text-slate-400 max-w-md mb-4">
              We couldn&#39;t find any tasks that match your current filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
