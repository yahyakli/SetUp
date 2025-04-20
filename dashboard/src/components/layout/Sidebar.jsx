import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, UsersIcon, BriefcaseIcon, UserGroupIcon, 
  CreditCardIcon, ReceiptPercentIcon as ReceiptIcon, 
  XMarkIcon as XIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ collapsed, mobileMenuOpen, setMobileMenuOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Projects', href: '/dashboard/projects', icon: BriefcaseIcon },
    { name: 'Teams', href: '/dashboard/teams', icon: UserGroupIcon },
    { name: 'Plans', href: '/dashboard/plans', icon: DocumentTextIcon },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCardIcon },
    { name: 'Invoices', href: '/dashboard/invoices', icon: ReceiptIcon },
  ];

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 lg:hidden ${mobileMenuOpen ? '' : 'hidden'}`} role="dialog" aria-modal="true">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Sidebar component */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-dark-800 transition-all transform">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold text-primary-500">SetUp Admin</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    location.pathname === item.href || 
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                      ? 'bg-primary-50 dark:bg-primary-900 text-primary-500'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <item.icon
                    className={`mr-4 flex-shrink-0 h-6 w-6 ${
                      location.pathname === item.href || 
                      (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'lg:w-16' : 'lg:w-64'}`}>
        <div className="flex flex-col w-full">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className={`flex items-center flex-shrink-0 px-4 ${collapsed ? 'justify-center' : ''}`}>
                {!collapsed ? (
                  <h1 className="text-xl font-bold text-primary-500">SetUp Admin</h1>
                ) : (
                  <h1 className="text-xl font-bold text-primary-500">SA</h1>
                )}
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      location.pathname === item.href || 
                      (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                    }`}
                    title={collapsed ? item.name : ''}
                  >
                    <item.icon
                      className={`flex-shrink-0 h-6 w-6 ${
                        collapsed ? '' : 'mr-3'
                      } ${
                        location.pathname === item.href || 
                        (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
                          ? 'text-primary-500'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                      }`}
                      aria-hidden="true"
                    />
                    {!collapsed && item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 