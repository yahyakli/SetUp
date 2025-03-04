import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import { Menu, LogOut, UserCircle } from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import UserAvatar from './UserAvatar';
import { logout } from '@/lib/features/userSlice';

export const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);
  const pathname = usePathname(); // Get the current path

  const handleLogout = () => {
    dispatch(logout());
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to determine if the link is active
  const isActive = (path: string) => pathname === path;

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

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                <UserAvatar user={user} />
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

              <DropdownMenuItem onClick={handleLogout} className="focus:text-destructive duration-300">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-full h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-6 w-4/5 max-w-xs">
            {/* Theme toggle at the top right of mobile menu */}
            <div className="absolute left-4 top-4">
              <ThemeToggle />
            </div>

            {/* Add SheetTitle here */}
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>

            <div className="flex flex-col space-y-6 pt-10">
              <Link href="/" className={`text-base font-medium text-muted-foreground hover:text-foreground/80 transition-colors`}>
                Home
              </Link>
              <Link href="/dashboard" className={`text-base font-medium ${isActive('/dashboard') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground/80 transition-colors`}>
                Dashboard
              </Link>
              <Link href="/projects" className={`text-base font-medium ${isActive('/projects') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground transition-colors`}>
                My Projects
              </Link>
              <Link href="/teams" className={`text-base font-medium ${isActive('/teams') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground transition-colors`}>
                My teams
              </Link>
              <Link href="/chat" className={`text-base font-medium ${isActive('/chat') ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground transition-colors`}>
                Chat
              </Link>

              {/* User options in mobile menu */}
              <div className="pt-6 space-y-4">
                <div className="h-px w-full bg-border"></div>

                <Link href="/profile" className="flex items-center text-base gap-2 font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <UserAvatar user={user} />
                  Profile
                </Link>

                <button onClick={handleLogout} className="flex items-center text-base font-medium text-destructive hover:text-destructive/80 transition-colors w-full">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};