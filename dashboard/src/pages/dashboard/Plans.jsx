import DataTable from '../../components/dashboard/DataTable';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';

const Plans = () => {
  const { plans, loadingPlans } = useApp();
  
  const columns = [
    { key: 'name', label: 'Plan Name' },
    { 
      key: 'price', 
      label: 'Price',
      render: (plan) => {
        return `$${plan.price}/${plan.billing_cycle || 'month'}`;
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (plan) => {
        const status = plan.status || 'Active';
        let statusClass = '';
        
        switch(status.toLowerCase()) {
          case 'active':
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            break;
          case 'inactive':
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            break;
          case 'archived':
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            break;
          default:
            statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {status}
          </span>
        );
      }
    },
    { key: 'description', label: 'Description' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: () => {
        return (
          <div className="flex space-x-2">
            <button className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              <PencilIcon className="w-5 h-5" />
            </button>
            <button className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        );
      }
    },
  ];


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plans</h1>
        <button className="btn-primary flex items-center">
          <PlusIcon className="w-5 h-5 mr-1" />
          Add Plan
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={plans} 
        title="Subscription Plans" 
        pagination={true}
        itemsPerPage={8}
        loading={loadingPlans}
      />
    </div>
  );
};

export default Plans; 