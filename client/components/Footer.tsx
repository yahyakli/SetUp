import Link from "next/link";

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
                <Link href="/plans" className="hover:text-gray-900 dark:hover:text-white">
                  Plans
                </Link>
              </li>
              <li>
                <a href="/integrations" className="hover:text-gray-900 dark:hover:text-white">
                  Integrations
                </a>
              </li>
              <li>
                <Link href="/enterprise" className="hover:text-gray-900 dark:hover:text-white">
                  Enterprise
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="hover:text-gray-900 dark:hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-gray-900 dark:hover:text-white">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-gray-900 dark:hover:text-white">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-gray-900 dark:hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-gray-900 dark:hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-gray-900 dark:hover:text-white">
                  Legal
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-gray-700 dark:text-gray-300">
            &copy; 2025 SetUp. All rights reserved. made by <a href="https://akliyahya.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">AKLI YAHYA</a>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-gray-900 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-gray-900 dark:hover:text-white">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="hover:text-gray-900 dark:hover:text-white">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};