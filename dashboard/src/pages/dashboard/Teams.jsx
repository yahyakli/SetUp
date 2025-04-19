import DataTable from '../../components/dashboard/DataTable';import { PencilIcon, TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';

const Teams = () => {
  const { teams, getUserById } = useApp();

  const columns = [
    { key: 'name', label: 'Team Name' },
    { key: 'lead', label: 'Team Lead', render: (team) => {
      const teamOwner = team.members.find(member => member.role === 'owner');
      const user = getUserById(teamOwner.user_id);
      return user.firstName + ' ' + user.lastName;
    }},
    { key: 'members', label: 'Members', render: (team) => {
      return team.members.length;
    } },
    { key: 'projects', label: 'Active Projects', render: (team) => {
      return team.projects.length;
    }},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teams</h1>
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