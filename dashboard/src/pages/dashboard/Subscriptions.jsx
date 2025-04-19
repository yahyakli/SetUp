import DataTable from '../../components/dashboard/DataTable';
import { useApp } from '../../context/AppContext';

const Subscriptions = () => {
  const { subscriptions, getUserById, getPlanById, loadingPlans, loadingSubscriptions } = useApp();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const columns = [
    { key: 'plan_id', label: 'Plan', render: (subscription) => {
      if (loadingPlans) {
        return <div>Loading...</div>;
      }
      const plan = getPlanById(subscription.plan_id);
      return plan.name;
    } },
    { key: 'user_id', label: 'Customer', render: (subscription) => {
      const user = getUserById(subscription.user_id);
      return user.firstName + ' ' + user.lastName;
    } },
    { 
      key: 'status', 
      label: 'Status',
      render: (subscription) => {
        const status = subscription.status || 'Unknown';
        let statusClass = '';
        
        // Convert to lowercase for case-insensitive comparison
        switch(status.toLowerCase()) {
          case 'active':
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            break;
          case 'expired':
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            break;
          case 'cancelled':
          case 'canceled': // Handle alternative spelling
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {status}
          </span>
        );
      }
    },
    { key: 'start_date', label: 'Start Date', render: (subscription) => {
      return formatDate(subscription.start_date);
    } },
    { key: 'end_date', label: 'End Date', render: (subscription) => {
      return formatDate(subscription.end_date);
    } },
    { key: 'amount', label: 'Amount', render: (subscription) => {
      if (loadingPlans) {
        return <div>Loading...</div>;
      }
      const plan = getPlanById(subscription.plan_id);
      return plan.price;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
      </div>
      
      <DataTable 
        columns={columns} 
        data={subscriptions} 
        title="All Subscriptions" 
        pagination={true}
        itemsPerPage={8}
        loading={loadingSubscriptions}
      />
    </div>
  );
};

export default Subscriptions; 