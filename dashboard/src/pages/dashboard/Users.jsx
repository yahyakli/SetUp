import { useState } from 'react';
import DataTable from '../../components/dashboard/DataTable';
import { PencilIcon, TrashIcon, UserPlusIcon as UserAddIcon } from '@heroicons/react/24/outline';

const Users = () => {
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', joinDate: '2023-02-20' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'User', status: 'Inactive', joinDate: '2023-03-10' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'Manager', status: 'Active', joinDate: '2023-03-15' },
    { id: 5, name: 'Michael Wilson', email: 'michael@example.com', role: 'User', status: 'Active', joinDate: '2023-04-05' },
    { id: 6, name: 'Sarah Brown', email: 'sarah@example.com', role: 'User', status: 'Active', joinDate: '2023-04-20' },
    { id: 7, name: 'David Miller', email: 'david@example.com', role: 'Manager', status: 'Active', joinDate: '2023-05-12' },
    { id: 8, name: 'Jennifer Taylor', email: 'jennifer@example.com', role: 'User', status: 'Inactive', joinDate: '2023-05-25' },
    { id: 9, name: 'James Anderson', email: 'james@example.com', role: 'User', status: 'Active', joinDate: '2023-06-10' },
    { id: 10, name: 'Lisa Thomas', email: 'lisa@example.com', role: 'User', status: 'Active', joinDate: '2023-06-22' },
    { id: 11, name: 'Daniel Jackson', email: 'daniel@example.com', role: 'User', status: 'Active', joinDate: '2023-07-05' },
    { id: 12, name: 'Amanda White', email: 'amanda@example.com', role: 'Manager', status: 'Active', joinDate: '2023-07-18' },
  ]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { 
      key: 'status', 
      label: 'Status',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          user.status === 'Active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {user.status}
        </span>
      )
    },
    { key: 'joinDate', label: 'Join Date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={`Edit ${user.name}`}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            aria-label={`Delete ${user.name}`}
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
        <h1 className="text-2xl font-bold">Users</h1>
      </div>
      
      <DataTable 
        columns={columns} 
        data={users} 
        title="All Users" 
        pagination={true}
        itemsPerPage={8}
      />
    </div>
  );
};

export default Users; 