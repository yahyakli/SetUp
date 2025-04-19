import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  ArrowRightOnRectangleIcon as LogoutIcon,
  Bars3Icon as MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar, sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleToggle = () => {
    // For mobile: toggle the mobile menu
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(!mobileMenuOpen);
    } 
    // For desktop: toggle the sidebar collapse state
    else {
      toggleSidebar();
    }
  };

  return (
    <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={handleToggle}
              className="mr-4 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 focus:outline-none"
              aria-label={window.innerWidth < 1024 ? "Toggle mobile menu" : "Toggle sidebar"}
            >
              {window.innerWidth < 1024 ? (
                <MenuIcon className="h-5 w-5" aria-hidden="true" />
              ) : sidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 focus:outline-none"
                aria-label="Logout"
              >
                <LogoutIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 