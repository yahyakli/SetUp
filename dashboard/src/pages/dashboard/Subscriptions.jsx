import { useState } from 'react';
import DataTable from '../../components/dashboard/DataTable';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/outline';

const Subscriptions = () => {
  const [subscriptions] = useState([
    { id: 1, plan: 'Basic', customer: 'John Doe', status: 'Active', startDate: '2023-01-15', endDate: '2024-01-15', amount: '$99/year' },
    { id: 2, plan: 'Pro', customer: 'ABC Corp', status: 'Active', startDate: '2023-02-10', endDate: '2024-02-10', amount: '$199/year' },
    { id: 3, plan: 'Enterprise', customer: 'XYZ Inc', status: 'Active', startDate: '2023-01-05', endDate: '2024-01-05', amount: '$499/year' },
    { id: 4, plan: 'Basic', customer: 'Jane Smith', status: 'Expired', startDate: '2022-03-20', endDate: '2023-03-20', amount: '$99/year' },
    { id: 5, plan: 'Pro', customer: 'New Startup', status: 'Active', startDate: '2023-04-15', endDate: '2024-04-15', amount: '$199/year' },
    { id: 6, plan: 'Basic', customer: 'Small Business', status: 'Cancelled', startDate: '2023-02-01', endDate: '2023-05-01', amount: '$99/year' },
    { id: 7, plan: 'Enterprise', customer: 'Big Corp', status: 'Active', startDate: '2023-03-10', endDate: '2024-03-10', amount: '$499/year' },
    { id: 8, plan: 'Pro', customer: 'Tech Team', status: 'Active', startDate: '2023-05-05', endDate: '2024-05-05', amount: '$199/year' },
    { id: 9, plan: 'Basic', customer: 'Freelancer', status: 'Active', startDate: '2023-06-01', endDate: '2024-06-01', amount: '$99/year' },
    { id: 10, plan: 'Pro', customer: 'Design Agency', status: 'Active', startDate: '2023-04-20', endDate: '2024-04-20', amount: '$199/year' },
  ]);

  const columns = [
    { key: 'plan', label: 'Plan' },
    { key: 'customer', label: 'Customer' },
    { 
      key: 'status', 
      label: 'Status',
      render: (subscription) => {
        let statusClass = '';
        switch(subscription.status) {
          case 'Active':
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            break;
          case 'Expired':
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            break;
          case 'Cancelled':
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {subscription.status}
          </span>
        );
      }
    },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'amount', label: 'Amount' },
    {
      key: 'actions',
      label: 'Actions',
      render: (subscription) => (
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={`Edit subscription for ${subscription.customer}`}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            aria-label={`Delete subscription for ${subscription.customer}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <button className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Subscription
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={subscriptions} 
        title="All Subscriptions" 
        pagination={true}
        itemsPerPage={8}
      />
    </div>
  );
};

export default Subscriptions; 