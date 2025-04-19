import { UsersIcon, BriefcaseIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/outline';
import StatCard from '../../components/dashboard/StatCard';
import LineChart from '../../components/dashboard/LineChart';
import BarChart from '../../components/dashboard/BarChart';
import PieChart from '../../components/dashboard/PieChart';

const Overview = () => {
  // Mock data for stats
  const stats = [
    { title: 'Total Users', value: '2,543', icon: UsersIcon, change: '12%', changeType: 'increase' },
    { title: 'Active Projects', value: '95', icon: BriefcaseIcon, change: '8%', changeType: 'increase' },
    { title: 'Teams', value: '48', icon: UserGroupIcon, change: '5%', changeType: 'increase' },
    { title: 'Monthly Income', value: '$42,500', icon: CurrencyDollarIcon, change: '3%', changeType: 'decrease' },
  ];

  // Mock data for charts
  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const projectsData = [12, 19, 15, 22, 30, 25, 28, 32, 35, 40, 38, 42];
  
  const incomeData = [
    15000, 18000, 22000, 25000, 28000, 30000, 32000, 35000, 38000, 42000, 40000, 42500
  ];
  
  const teamDistributionLabels = ['Development', 'Design', 'Marketing', 'Sales', 'Support'];
  const teamDistributionData = [40, 20, 15, 15, 10];
  
  const userGrowthData = [1200, 1350, 1500, 1800, 2100, 2300, 2400, 2450, 2480, 2510, 2530, 2543];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </div>
      
      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart 
          title="User Growth" 
          data={userGrowthData} 
          labels={monthlyLabels} 
        />
        <BarChart 
          title="Projects by Month" 
          data={projectsData} 
          labels={monthlyLabels} 
        />
      </div>
      
      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart 
          title="Monthly Income ($)" 
          data={incomeData} 
          labels={monthlyLabels} 
        />
        <PieChart 
          title="Team Distribution" 
          data={teamDistributionData} 
          labels={teamDistributionLabels} 
        />
      </div>
    </div>
  );
};

export default Overview; 