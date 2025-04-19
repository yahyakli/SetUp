import { useState } from 'react';
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  ArrowTrendingDownIcon as TrendingDownIcon 
} from '@heroicons/react/24/outline';
import LineChart from '../../components/dashboard/LineChart';
import BarChart from '../../components/dashboard/BarChart';
import StatCard from '../../components/dashboard/StatCard';
import DataTable from '../../components/dashboard/DataTable';

const Income = () => {
  // Mock data for stats
  const stats = [
    { 
      title: 'Total Revenue', 
      value: '$425,000', 
      icon: CurrencyDollarIcon, 
      change: '12%', 
      changeType: 'increase' 
    },
    { 
      title: 'Monthly Revenue', 
      value: '$42,500', 
      icon: CurrencyDollarIcon, 
      change: '3%', 
      changeType: 'decrease' 
    },
    { 
      title: 'Profit Margin', 
      value: '68%', 
      icon: TrendingUpIcon, 
      change: '5%', 
      changeType: 'increase' 
    },
    { 
      title: 'Expenses', 
      value: '$136,000', 
      icon: TrendingDownIcon, 
      change: '2%', 
      changeType: 'increase' 
    },
  ];

  // Mock data for charts
  const monthlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const revenueData = [
    32000, 36000, 28000, 40000, 42000, 38000, 35000, 39000, 42000, 45000, 40000, 42500
  ];
  
  const expensesData = [
    12000, 13000, 10000, 14000, 11000, 12500, 13000, 12000, 13500, 14000, 13000, 14000
  ];
  
  const profitData = revenueData.map((revenue, index) => revenue - expensesData[index]);

  // Mock data for income sources
  const [incomeSources] = useState([
    { source: 'Subscriptions', amount: '$250,000', percentage: '58.8%' },
    { source: 'One-time Purchases', amount: '$85,000', percentage: '20.0%' },
    { source: 'Service Fees', amount: '$45,000', percentage: '10.6%' },
    { source: 'Consulting', amount: '$35,000', percentage: '8.2%' },
    { source: 'Other', amount: '$10,000', percentage: '2.4%' },
  ]);

  const incomeColumns = [
    { key: 'source', label: 'Income Source' },
    { key: 'amount', label: 'Amount' },
    { key: 'percentage', label: 'Percentage' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Income</h1>
      
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
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart 
          title="Revenue vs Expenses" 
          data={revenueData} 
          labels={monthlyLabels} 
        />
        <BarChart 
          title="Monthly Profit" 
          data={profitData} 
          labels={monthlyLabels} 
        />
      </div>
      
      {/* Income Sources Table */}
      <DataTable 
        columns={incomeColumns} 
        data={incomeSources} 
        title="Income Sources" 
        pagination={false}
      />
    </div>
  );
};

export default Income; 