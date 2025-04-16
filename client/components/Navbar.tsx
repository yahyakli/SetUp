import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, UserCircle, ChevronDown, Bell, CreditCard, ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import UserAvatar from './UserAvatar';
import { logout } from '@/lib/features/userSlice';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import CreateTeamDialog from './CreateTeamDialog';
import { Project, Team, Task } from '@/types/index';
import { useAppContext } from '@/context/AppContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Navbar = () => {
  const { teams } = useSelector((state: RootState) => state.teams);
  const { projects } = useSelector((state: RootState) => state.projects)
  const { user } = useSelector((state: RootState) => state.user);
  const { invitations } = useSelector((state: RootState) => state.Invitations);
  const { notifications } = useSelector((state: RootState) => state.notification)
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const [recentTeams, setRecentTeams] = useState<Team[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  const { authCheckComplete, userPermissions } = useAppContext();

  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [subscriptionExpanded, setSubscriptionExpanded] = useState(false);

  useEffect(() => {
    if (teams.length > 0) {
      setRecentTeams(teams.slice(0, 3));
    }
  }, [teams]);

  useEffect(() => {
    if (projects.length > 0) {
      setRecentProjects(projects.slice(0, 3));
    }
  }, [projects]);

  useEffect(() => {
    if (tasks.length > 0) {
      // Sort tasks by updated_at in descending order and take the first 6
      const sortedTasks = [...tasks].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ).slice(0, 6);

      setRecentTasks(sortedTasks);
    }
  }, [tasks]);

  const handleLogout = () => {
    dispatch(logout());
  }

  const scrollToTop = () => {
    if (pathname !== '/dashboard') {
      if (authCheckComplete) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  const getPendingNotificationsAndInvitationsCount = () => {
    return notifications.filter(not => !not.read ).length + invitations.filter(inv => inv.status === 'pending').length;
  };

  // Check if user has chat permission
  const hasChatPermission = userPermissions?.chat === true;
  
  // Check if user can create more projects
  const canCreateProject = userPermissions?.projects 
    ? userPermissions.projects === -1 || projects.length < userPermissions.projects 
    : false;
  
  // Check if user can create more teams
  const canCreateTeam = userPermissions?.teams 
    ? userPermissions.teams === -1 || teams.length < userPermissions.teams 
    : false;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8 mx-auto">
        {/* Logo and brand */}
        <div className="flex items-center">
          <div onClick={scrollToTop} className="text-2xl font-bold flex items-center cursor-pointer">
            <span className="text-blue-600 dark:text-blue-400">Set</span>
            <span className="text-gray-900 dark:text-white">Up</span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className={`cursor-pointer p-1 text-sm font-medium ${isActive('/dashboard') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground/80 transition-colors py-2 flex items-center`}>
            Dashboard
          </Link>

          {/* Projects Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`cursor-pointer p-1 text-sm font-medium ${isActive('/projects') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground/80 transition-colors py-2 flex items-center`}>
              Projects
              <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className='font-light text-xs dark:text-gray-300 text-gray-500'>Recent Projects</DropdownMenuLabel>
              {recentProjects.map((project) => (
                <DropdownMenuItem key={project.id} asChild>
                  <Link href={`/projects/${project.id}`} className="cursor-pointer">
                    {project.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/projects" className="font-semibold cursor-pointer">
                  Show All Projects
                </Link>
              </DropdownMenuItem>
              {canCreateProject ? (
                <DropdownMenuItem asChild>
                  <Link href="/projects/create" className="cursor-pointer">
                    Create New Project
                  </Link>
                </DropdownMenuItem>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-2 py-1.5 text-sm text-gray-400 cursor-not-allowed flex items-center">
                        Create New Project
                        <Lock className="ml-1 h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You&#39;ve reached your project limit ({userPermissions?.projects === -1 ? 'Unlimited' : userPermissions?.projects}). <Link href="/plans" className="underline font-medium">Upgrade now</Link> to create more projects.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Teams Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`cursor-pointer p-1 text-sm font-medium ${isActive('/teams') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground/80 transition-colors py-2 flex items-center`}>
              Teams
              <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className='font-light text-xs dark:text-gray-300 text-gray-500'>Recent Teams</DropdownMenuLabel>
              {recentTeams.map((team) => (
                <DropdownMenuItem key={team.id} asChild>
                  <Link href={`/teams/${team.id}`} className="cursor-pointer">
                    {team.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/teams" className="font-semibold cursor-pointer">
                  Show All Your Teams
                </Link>
              </DropdownMenuItem>
              {canCreateTeam ? (
                <DropdownMenuItem onSelect={(e) => {
                  e.preventDefault();
                  setCreateTeamDialogOpen(true);
                }}>
                  Create New Team
                </DropdownMenuItem>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="px-2 py-1.5 text-sm text-gray-400 cursor-not-allowed flex items-center">
                        Create New Team
                        <Lock className="ml-1 h-3 w-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>You&#39;ve reached your team limit ({userPermissions?.teams === -1 ? 'Unlimited' : userPermissions?.teams}). <Link href="/plans" className="underline font-medium">Upgrade now</Link> to create more teams.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tasks Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`cursor-pointer p-1 text-sm font-medium ${isActive('/tasks') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground/80 transition-colors py-2 flex items-center`}>
              Tasks
              <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className='font-light text-xs dark:text-gray-300 text-gray-500'>Recent Tasks</DropdownMenuLabel>
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <DropdownMenuItem key={task._id} asChild>
                    <Link href={`/tasks/${task._id}`} className="cursor-pointer">
                      {task.title}
                    </Link>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No recent tasks</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/tasks" className="font-semibold cursor-pointer">
                  All My Tasks
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Chat Link - Replacing Plans Dropdown */}
          {hasChatPermission ? (
            <Link href="/chat" className={`cursor-pointer p-1 text-sm font-medium ${isActive('/chat') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground/80 transition-colors py-2 flex items-center`}>
              Chat
            </Link>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`cursor-not-allowed p-1 text-sm font-medium text-gray-400 py-2 flex items-center`}>
                    Chat
                    <Lock className="ml-1 h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chat is not available in your current plan. <Link href="/plans" className="underline font-medium">Upgrade now</Link> to unlock this feature.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className='cursor-pointer relative' asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <UserAvatar user={user} />
                {getPendingNotificationsAndInvitationsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white dark:bg-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getPendingNotificationsAndInvitationsCount()}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-72">
              {user ? (
                <>
                  <div className="flex items-center justify-start gap-2 py-2 px-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <UserAvatar user={user} />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <div className='flex items-center gap-1'>
                        <p className="text-sm font-medium">{user.firstName || 'User'}</p>
                        <p className="text-sm font-medium">{user.lastName || 'User'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email || ''}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                </>
              ) : null}

              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex cursor-pointer items-center">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/notifications" className="flex cursor-pointer items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </div>
                  {getPendingNotificationsAndInvitationsCount() > 0 && (
                    <span className="bg-black text-white dark:bg-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                      {getPendingNotificationsAndInvitationsCount()}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>

              {/* Collapsible Subscription Menu */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setSubscriptionExpanded(!subscriptionExpanded);
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${subscriptionExpanded ? 'rotate-90' : ''}`} />
                </div>
              </DropdownMenuItem>

              {subscriptionExpanded && (
                <>
                  <DropdownMenuItem asChild className="pl-8">
                    <Link href="/plans" className="flex cursor-pointer items-center">
                      <span>Current Plan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="pl-8">
                    <Link href="/plans" className="flex cursor-pointer items-center">
                      <span>Upgrade Plan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="pl-8">
                    <Link href="/plans/billing" className="flex cursor-pointer items-center">
                      <span>Billing History</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} className="focus:text-destructive duration-300">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-full h-10 w-10 relative">
              <Menu className="h-5 w-5" />
              {getPendingNotificationsAndInvitationsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getPendingNotificationsAndInvitationsCount()}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-4/5 max-w-xs">
            {/* Theme toggle at the top right of mobile menu */}
            <div className="absolute left-4 top-4 z-50">
              <ThemeToggle />
            </div>

            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>

            <div className="h-full overflow-y-auto">
              <Accordion type="single" collapsible className="w-full pt-14">

                {/* Dashboard Accordion */}
                <AccordionItem value="Dashboard" className="border-b">
                  <Link href="/dashboard" className={`flex items-center justify-between px-4 py-4 ${isActive('/dashboard') ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Dashboard
                  </Link>
                </AccordionItem>

                {/* Projects Accordion */}
                <AccordionItem value="projects" className="border-b">
                  <AccordionTrigger className={`px-4 ${isActive('/projects') ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Projects
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-2">
                    {recentProjects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        {project.name}
                      </Link>
                    ))}
                    <Link
                      href="/projects"
                      className="block text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Show All Projects
                    </Link>
                    {canCreateProject ? (
                      <Link
                        href="/projects/create"
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        Create New Project
                      </Link>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm text-gray-400 cursor-not-allowed flex items-center">
                              Create New Project
                              <Lock className="ml-1 h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You&#39;ve reached your project limit ({userPermissions?.projects === -1 ? 'Unlimited' : userPermissions?.projects}). <Link href="/plans" className="underline font-medium">Upgrade now</Link> to create more projects.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Teams Accordion - Added for mobile */}
                <AccordionItem value="teams" className="border-b">
                  <AccordionTrigger className={`px-4 ${isActive('/teams') ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Teams
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-2">
                    {recentTeams.map((team) => (
                      <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        className="block text-sm text-muted-foreground hover:text-foreground"
                      >
                        {team.name}
                      </Link>
                    ))}
                    <Link
                      href="/teams"
                      className="block text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Show All Your Teams
                    </Link>
                    {canCreateTeam ? (
                      <button
                        onClick={() => setCreateTeamDialogOpen(true)}
                        className="block text-sm text-muted-foreground hover:text-foreground text-left w-full"
                      >
                        Create New Team
                      </button>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-sm text-gray-400 cursor-not-allowed flex items-center">
                              Create New Team
                              <Lock className="ml-1 h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You&#39;ve reached your team limit ({userPermissions?.teams === -1 ? 'Unlimited' : userPermissions?.teams}). <Link href="/plans" className="underline font-medium">Upgrade now</Link> to create more teams.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Tasks Accordion */}
                <AccordionItem value="tasks" className="border-b">
                  <AccordionTrigger className={`px-4 ${isActive('/tasks') ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Tasks
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-2">
                    {recentTasks.length > 0 ? (
                      recentTasks.map((task) => (
                        <Link
                          key={task._id}
                          href={`/tasks/${task._id}`}
                          className="block text-sm text-muted-foreground hover:text-foreground"
                        >
                          {task.title}
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent tasks</p>
                    )}
                    <Link
                      href="/tasks"
                      className="block text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      All Tasks
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                {/* Chat Link */}
                <AccordionItem value="chat" className="border-b">
                  {hasChatPermission ? (
                    <Link href="/chat" className={`flex items-center justify-between px-4 py-4 ${isActive('/chat') ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Chat
                    </Link>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-between px-4 py-4 text-gray-400 cursor-not-allowed">
                            Chat
                            <Lock className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chat is not available in your current plan. <Link href="/plans" className="underline font-medium">Upgrade now</Link> to unlock this feature.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </AccordionItem>

                {/* User Section */}
                <div className="px-4 py-4 border-t">
                  <div className="flex items-center mb-4 gap-2">
                    <UserAvatar user={user} />
                    <div>
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href="/notifications"
                      className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground"
                    >
                      <div className="flex items-center">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </div>
                      {getPendingNotificationsAndInvitationsCount() > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getPendingNotificationsAndInvitationsCount()}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>

                    {/* Collapsible Plans options in mobile menu */}
                    <div className="pt-2 mt-2 border-t">
                      <button
                        onClick={() => setSubscriptionExpanded(!subscriptionExpanded)}
                        className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground mb-2"
                      >
                        <div className="flex items-center">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Subscription</span>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-transform ${subscriptionExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {subscriptionExpanded && (
                        <div className="pl-6 space-y-2 mt-2">
                          <Link
                            href="/plans"
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                          >
                            Current Plan
                          </Link>
                          <Link
                            href="/plans"
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                          >
                            Upgrade Plan
                          </Link>
                          <Link
                            href="/plans/billing"
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                          >
                            Billing History
                          </Link>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </Accordion>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <CreateTeamDialog
        open={createTeamDialogOpen}
        onOpenChange={setCreateTeamDialogOpen}
      />
    </header>
  );
};