import { useState } from 'react';
import DataTable from '../../components/dashboard/DataTable';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/outline';

const Projects = () => {
  const [projects] = useState([
    { id: 1, name: 'Website Redesign', client: 'ABC Corp', team: 'Design', status: 'In Progress', startDate: '2023-01-10', endDate: '2023-03-15', budget: '$12,000' },
    { id: 2, name: 'Mobile App Development', client: 'XYZ Inc', team: 'Development', status: 'In Progress', startDate: '2023-02-05', endDate: '2023-06-30', budget: '$45,000' },
    { id: 3, name: 'E-commerce Platform', client: 'Shop Easy', team: 'Development', status: 'Completed', startDate: '2022-11-15', endDate: '2023-02-28', budget: '$35,000' },
    { id: 4, name: 'Brand Identity', client: 'New Startup', team: 'Design', status: 'In Progress', startDate: '2023-03-01', endDate: '2023-04-15', budget: '$8,500' },
    { id: 5, name: 'SEO Optimization', client: 'Local Business', team: 'Marketing', status: 'Not Started', startDate: '2023-04-10', endDate: '2023-05-30', budget: '$5,000' },
    { id: 6, name: 'CRM Implementation', client: 'Sales Co', team: 'Development', status: 'In Progress', startDate: '2023-02-15', endDate: '2023-05-15', budget: '$28,000' },
    { id: 7, name: 'Social Media Campaign', client: 'Fashion Brand', team: 'Marketing', status: 'Completed', startDate: '2023-01-05', endDate: '2023-02-15', budget: '$7,500' },
    { id: 8, name: 'Internal Dashboard', client: 'Our Company', team: 'Development', status: 'In Progress', startDate: '2023-03-10', endDate: '2023-06-10', budget: '$18,000' },
    { id: 9, name: 'Product Launch', client: 'Tech Innovators', team: 'Marketing', status: 'Not Started', startDate: '2023-05-01', endDate: '2023-06-15', budget: '$12,500' },
    { id: 10, name: 'Customer Portal', client: 'Service Provider', team: 'Development', status: 'In Progress', startDate: '2023-02-20', endDate: '2023-07-30', budget: '$32,000' },
  ]);

  const columns = [
    { key: 'name', label: 'Project Name' },
    { key: 'client', label: 'Client' },
    { key: 'team', label: 'Team' },
    { 
      key: 'status', 
      label: 'Status',
      render: (project) => {
        let statusClass = '';
        switch(project.status) {
          case 'Completed':
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            break;
          case 'In Progress':
            statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            break;
          case 'Not Started':
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {project.status}
          </span>
        );
      }
    },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'budget', label: 'Budget' },
    {
      key: 'actions',
      label: 'Actions',
      render: (project) => (
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
            aria-label={`Edit ${project.name}`}
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button 
            className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            aria-label={`Delete ${project.name}`}
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
        <h1 className="text-2xl font-bold">Projects</h1>
        <button className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Project
        </button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={projects} 
        title="All Projects" 
        pagination={true}
        itemsPerPage={8}
      />
    </div>
  );
};

export default Projects; 