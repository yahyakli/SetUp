import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, UserCircle, ChevronDown, Bell } from 'lucide-react';
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
import { Project, Team } from '@/types';

export const Navbar = () => {
  const { teams } = useSelector((state: RootState) => state.teams);
  const { projects } = useSelector((state: RootState) => state.projects)
  const { user } = useSelector((state: RootState) => state.user);
  const { invitations } = useSelector((state: RootState) => state.Invitations);
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const [recentTeams, setRecentTeams] = useState<Team[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);

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

  const handleLogout = () => {
    dispatch(logout());
  }

  const scrollToTop = () => {
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isActive = (path: string) => pathname === path;

  const getPendingInvitationsCount = () => {
    return invitations.filter(inv => inv.status === 'pending').length;
  };

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
              <DropdownMenuItem asChild>
                <Link href="/projects/create" className="cursor-pointer">
                  Create New Project
                </Link>
              </DropdownMenuItem>
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
              <DropdownMenuItem onSelect={(e) => {
                e.preventDefault();
                setCreateTeamDialogOpen(true);
              }}>
                Create New Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Chat Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`cursor-pointer p-1 text-sm font-medium ${isActive('/chat') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground/80 transition-colors py-2 flex items-center`}>
              Chat
              <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className='font-light text-xs dark:text-gray-300 text-gray-500'>Chat Groups</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/chat/groups/team-alpha" className="cursor-pointer">
                  Team Alpha
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/chat/groups/marketing" className="cursor-pointer">
                  Marketing Team
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/chat/groups/engineering" className="cursor-pointer">
                  Engineering Group
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/chat/groups/create" className="cursor-pointer">
                  Create New Group
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/chat" className="font-semibold cursor-pointer">
                  All Chats
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Plans Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className={`cursor-pointer p-1 text-sm font-medium ${isActive('/plans') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground/80 transition-colors py-2 flex items-center`}>
              Plans
              <ChevronDown className="ml-2 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className='font-light text-xs dark:text-gray-300 text-gray-500'>Subscription Options</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href="/plans" className="cursor-pointer">
                  Current Plan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/plans/upgrade" className="cursor-pointer">
                  Upgrade Plan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/plans/billing" className="cursor-pointer">
                  Billing History
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className='cursor-pointer relative' asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <UserAvatar user={user} />
                {getPendingInvitationsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white dark:bg-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getPendingInvitationsCount()}
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
                  {getPendingInvitationsCount() > 0 && (
                    <span className="bg-black text-white dark:bg-white dark:text-black text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                      {getPendingInvitationsCount()}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>

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
              {getPendingInvitationsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getPendingInvitationsCount()}
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
                <AccordionItem value="dashboard" className="border-b">
                  <AccordionTrigger className={`px-4 ${isActive('/dashboard') ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Dashboard
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-2">
                    <Link
                      href="/projects/create"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Create New Project
                    </Link>
                    <Link
                      href="/tasks/create"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Create New Task
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Dashboard Home
                    </Link>
                  </AccordionContent>
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
                    <Link
                      href="/projects/create"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Create New Project
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                {/* Chat Accordion */}
                <AccordionItem value="chat" className="border-b">
                  <AccordionTrigger className={`px-4 ${isActive('/chat') ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Chat
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-2">
                    <Link
                      href="/chat/groups/team-alpha"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Team Alpha
                    </Link>
                    <Link
                      href="/chat/groups/marketing"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Marketing Team
                    </Link>
                    <Link
                      href="/chat/groups/engineering"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Engineering Group
                    </Link>
                    <Link
                      href="/chat/groups/create"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Create New Group
                    </Link>
                    <Link
                      href="/chat"
                      className="block text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      All Chats
                    </Link>
                  </AccordionContent>
                </AccordionItem>

                {/* Plans Accordion */}
                <AccordionItem value="plans" className="border-b">
                  <AccordionTrigger className={`px-4 ${isActive('/plans') ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Plans
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-2">
                    <Link
                      href="/plans"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Current Plan
                    </Link>
                    <Link
                      href="/plans/upgrade"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Upgrade Plan
                    </Link>
                    <Link
                      href="/plans/billing"
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      Billing History
                    </Link>
                  </AccordionContent>
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
                      {getPendingInvitationsCount() > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getPendingInvitationsCount()}
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

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
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