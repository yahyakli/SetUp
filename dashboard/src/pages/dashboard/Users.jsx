import DataTable from '../../components/dashboard/DataTable';
import { useApp } from '../../context/AppContext';

const Users = () => {
  const { users, loadingUsers } = useApp();
  
  // Format date function
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
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
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
    { 
      key: 'createdAt', 
      label: 'Join Date',
      render: (user) => formatDate(user.createdAt)
    },
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
        loading={loadingUsers}
      />
    </div>
  );
};

export default Users; 