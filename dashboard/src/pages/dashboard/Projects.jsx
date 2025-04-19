import DataTable from '../../components/dashboard/DataTable';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
const Projects = () => {
  const { projects, getUserById } = useApp();
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const columns = [
    { key: 'name', label: 'Project Name' },
    { key: 'owner_id', label: 'Owner', render: (project) => getUserById(project.owner_id).firstName + ' ' + getUserById(project.owner_id).lastName },
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
    { key: 'start_date', label: 'Start Date', render: (project) => formatDate(project.start_date) },
    { key: 'end_date', label: 'End Date', render: (project) => formatDate(project.end_date) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
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