export const Footer = () => {
  return (
    <footer className="py-12 px-18 bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-blue-600 dark:text-blue-400">Set</span>
              <span className="text-gray-900 dark:text-white">Up</span>
            </div>
            <p className="mb-4">
              Streamline your workflow and boost productivity with our powerful project management solution.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Products</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Enterprise
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900 dark:hover:text-white">
                  Legal
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-gray-700 dark:text-gray-300">
            &copy; 2025 SetUp. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};