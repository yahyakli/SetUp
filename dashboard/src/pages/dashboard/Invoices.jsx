import { useState } from 'react';
import DataTable from '../../components/dashboard/DataTable';
import { EyeIcon, ArrowDownTrayIcon as DocumentDownloadIcon, PlusIcon } from '@heroicons/react/24/outline';

const Invoices = () => {
  const [invoices] = useState([
    { id: 'INV-001', customer: 'John Doe', amount: '$99.00', status: 'Paid', date: '2023-01-15', dueDate: '2023-01-30' },
    { id: 'INV-002', customer: 'ABC Corp', amount: '$199.00', status: 'Paid', date: '2023-02-10', dueDate: '2023-02-25' },
    { id: 'INV-003', customer: 'XYZ Inc', amount: '$499.00', status: 'Paid', date: '2023-01-05', dueDate: '2023-01-20' },
    { id: 'INV-004', customer: 'Jane Smith', amount: '$99.00', status: 'Overdue', date: '2023-03-20', dueDate: '2023-04-04' },
    { id: 'INV-005', customer: 'New Startup', amount: '$199.00', status: 'Pending', date: '2023-04-15', dueDate: '2023-04-30' },
    { id: 'INV-006', customer: 'Small Business', amount: '$99.00', status: 'Paid', date: '2023-02-01', dueDate: '2023-02-16' },
    { id: 'INV-007', customer: 'Big Corp', amount: '$499.00', status: 'Pending', date: '2023-03-10', dueDate: '2023-03-25' },
    { id: 'INV-008', customer: 'Tech Team', amount: '$199.00', status: 'Paid', date: '2023-05-05', dueDate: '2023-05-20' },
    { id: 'INV-009', customer: 'Freelancer', amount: '$99.00', status: 'Paid', date: '2023-06-01', dueDate: '2023-06-16' },
    { id: 'INV-010', customer: 'Design Agency', amount: '$199.00', status: 'Pending', date: '2023-04-20', dueDate: '2023-05-05' },
  ]);

  const columns = [
    { key: 'id', label: 'Invoice ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'amount', label: 'Amount' },
    { 
      key: 'status', 
      label: 'Status',
      render: (invoice) => {
        let statusClass = '';
        switch(invoice.status) {
          case 'Paid':
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            break;
          case 'Pending':
            statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            break;
          case 'Overdue':
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {invoice.status}
          </span>
        );
      }
    },
    { key: 'date', label: 'Issue Date' },
    { key: 'dueDate', label: 'Due Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (invoice) => (
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={`View invoice ${invoice.id}`}
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={`Download invoice ${invoice.id}`}
          >
            <DocumentDownloadIcon className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>
      
      <DataTable 
        columns={columns} 
        data={invoices} 
        title="All Invoices" 
        pagination={true}
        itemsPerPage={8}
      />
    </div>
  );
};

export default Invoices; 