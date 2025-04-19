import { useState } from 'react';
import DataTable from '../../components/dashboard/DataTable';
import { PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/outline';

const Teams = () => {
  const [teams] = useState([
    { id: 1, name: 'Development', lead: 'John Smith', members: 12, projects: 8, department: 'Engineering' },
    { id: 2, name: 'Design', lead: 'Emily Johnson', members: 8, projects: 10, department: 'Product' },
    { id: 3, name: 'Marketing', lead: 'Michael Brown', members: 6, projects: 5, department: 'Marketing' },
    { id: 4, name: 'Sales', lead: 'Jessica Williams', members: 10, projects: 0, department: 'Sales' },
    { id: 5, name: 'Support', lead: 'David Miller', members: 15, projects: 0, department: 'Customer Success' },
    { id: 6, name: 'QA', lead: 'Sarah Davis', members: 7, projects: 8, department: 'Engineering' },
    { id: 7, name: 'DevOps', lead: 'Robert Wilson', members: 5, projects: 3, department: 'Engineering' },
    { id: 8, name: 'Content', lead: 'Jennifer Taylor', members: 4, projects: 6, department: 'Marketing' },
  ]);

  const columns = [
    { key: 'name', label: 'Team Name' },
    { key: 'lead', label: 'Team Lead' },
    { key: 'members', label: 'Members' },
    { key: 'projects', label: 'Active Projects' },
    { key: 'department', label: 'Department' },
    {
      key: 'actions',
      label: 'Actions',
      render: (team) => (
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={`Edit ${team.name}`}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            aria-label={`Delete ${team.name}`}
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
        <h1 className="text-2xl font-bold">Teams</h1>
        <button className="btn-primary flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Create Team
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={teams} 
        title="All Teams" 
        pagination={true}
        itemsPerPage={8}
      />
    </div>
  );
};

export default Teams; 