import { TASK_SERVICE_URL } from '@/constants/API_URLS';
import { RootState } from '@/lib/store';
import { Project, Task } from '@/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Plus, ListTodo, AlertCircle, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProjectTasksTab({ projectId }: { projectId: number }) {
  const { token } = useSelector((state: RootState) => state.user);
  const { projects } = useSelector((state: RootState) => state.projects);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${TASK_SERVICE_URL}/api/tasks/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.status === 200) {
          setTasks(res.data);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (token && projectId) {
      fetchTasks();
    }
  }, [projectId, token]);

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'No due date';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const project = projects.find(p => p.id === projectId);
  
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
      <Card className="p-6 border-destructive/50">
        <div className="flex flex-col items-center justify-center text-center py-10">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-6 border-dashed">
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <ListTodo className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-3">No Tasks Yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            This project doesn&#39;t have any tasks yet. Create your first task to start tracking progress.
          </p>
          <Link href={`/tasks/create?project=${projectId}`}>
            <Button className="flex items-center gap-2 px-6 py-5">
              <Plus className="h-5 w-5" />
              Create First Task
            </Button>
          </Link>
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
        <Link href={`/tasks/create?project=${projectId}`}>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tasks ({tasks.length > 0 ? tasks.length : 0})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-0 mt-0">
          {renderTaskList(filteredTasks, project, formatDate)}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-0 mt-0">
          {renderTaskList(filteredTasks, project, formatDate)}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-0 mt-0">
          {renderTaskList(filteredTasks, project, formatDate)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function renderTaskList(tasks: Task[], project: Project | undefined, formatDate: (date: string | Date) => string) {
  if (tasks.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center text-center py-10">
          <CalendarClock className="h-10 w-10 text-muted-foreground mb-3" />
          <h4 className="text-base font-medium mb-2">No tasks in this category</h4>
          <p className="text-sm text-muted-foreground">
            Try switching to a different tab or create a new task.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.length > 0 ? tasks.map((task) => (
        <Link key={task.id} href={`/tasks/${task.id}`}>
          <Card className="hover:bg-secondary/20 transition-all border-l-4 border-l-transparent hover:border-l-primary">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="text-green-500 h-5 w-5 flex-shrink-0" />
                ) : (
                  <Clock className="text-yellow-500 h-5 w-5 flex-shrink-0" />
                )}
                <div>
                  <div className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {project?.name || `Project #${task.project_id}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Badge
                  variant={
                    task.priority === 'High' ? 'destructive' :
                      task.priority === 'Medium' ? 'secondary' : 'outline'
                  }
                  className="whitespace-nowrap"
                >
                  {task.priority}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {task.due_date ? formatDate(task.due_date) : 'No due date'}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      )) : (
        <div className="flex justify-center items-center h-full">
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      )}
    </div>
  );
}
