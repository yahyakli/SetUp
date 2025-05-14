import { 
  UsersIcon, BriefcaseIcon, UserGroupIcon, CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import StatCard from '../../components/dashboard/StatCard';
import LineChart from '../../components/dashboard/LineChart';
import BarChart from '../../components/dashboard/BarChart';
import PieChart from '../../components/dashboard/PieChart';
import { useApp } from '../../context/AppContext';
import { useEffect, useState } from 'react';

const Overview = () => {
  const { users, loadingUsers, projects, loadingProjects, teams, loadingTeams, income, loadingIncome, invoices, loadingInvoices, teamMembers, loadingTeamMembers } = useApp();
  const [loading, setLoading] = useState(true);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [monthlyLabels, setMonthlyLabels] = useState([]);
  const [teamDistributionLabels, setTeamDistributionLabels] = useState([]);
  const [teamDistributionData, setTeamDistributionData] = useState([]);
  
  useEffect(() => {
    // Set loading to false even if arrays are empty but loading states are done
    const dataLoading = loadingUsers || loadingProjects || loadingTeams || loadingIncome || loadingInvoices || loadingTeamMembers;
    setLoading(dataLoading);
  }, [loadingUsers, loadingProjects, loadingTeams, loadingIncome, loadingInvoices, loadingTeamMembers]);
  
  // Calculate monthly labels (used by all charts)
  useEffect(() => {
    // Get current date and calculate date 12 months ago
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    oneYearAgo.setMonth(currentDate.getMonth() + 1); // Start from the same month last year
    oneYearAgo.setDate(1); // Start from the 1st day of the month
    
    // Generate labels for the last 12 months (including current month)
    const labels = [];
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(oneYearAgo);
      monthDate.setMonth(oneYearAgo.getMonth() + i);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      labels.push(monthName);
    }
    
    setMonthlyLabels(labels);
  }, []);
  
  // Calculate user growth data based on real user creation dates
  useEffect(() => {
    if (users.length > 0 && monthlyLabels.length > 0) {
      // Get current date and calculate date 12 months ago
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      oneYearAgo.setMonth(currentDate.getMonth() + 1); // Start from the same month last year
      oneYearAgo.setDate(1); // Start from the 1st day of the month
      
      const monthData = Array(12).fill(0);
      
      // Count users created in each month
      let userCount = 0;
      
      // Sort users by creation date
      const sortedUsers = [...users].sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      // Find users created before our chart range
      sortedUsers.forEach(user => {
        const creationDate = new Date(user.createdAt);
        if (creationDate < oneYearAgo) {
          userCount++;
        }
      });
      
      // Set initial count for all months
      monthData.fill(userCount);
      
      // Calculate cumulative user count for each month
      sortedUsers.forEach(user => {
        const creationDate = new Date(user.createdAt);
        
        // Only process users created within the last year
        if (creationDate >= oneYearAgo) {
          // Calculate months difference between creation date and one year ago
          const monthsDiff = 
            (creationDate.getFullYear() - oneYearAgo.getFullYear()) * 12 + 
            creationDate.getMonth() - oneYearAgo.getMonth();
          
          if (monthsDiff >= 0 && monthsDiff < 12) {
            // Update all months from the user's creation month to the current month
            for (let i = monthsDiff; i < 12; i++) {
              monthData[i]++;
            }
          }
        }
      });
      
      setUserGrowthData(monthData);
    } else {
      // Set default data for empty users array
      setUserGrowthData(Array(12).fill(0));
    }
  }, [users, monthlyLabels]);
  
  // Calculate projects data based on real project creation dates
  useEffect(() => {
    if (projects.length > 0 && monthlyLabels.length > 0) {
      // Get current date and calculate date 12 months ago
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      oneYearAgo.setMonth(currentDate.getMonth() + 1); // Start from the same month last year
      oneYearAgo.setDate(1); // Start from the 1st day of the month
      
      // Initialize array to count projects per month
      const monthData = Array(12).fill(0);
      
      // Count projects created in each month
      projects.forEach(project => {
        // Handle different date formats (both "created_at" and "createdAt")
        const creationDateStr = project.created_at || project.createdAt;
        if (!creationDateStr) return;
        
        const creationDate = new Date(creationDateStr);
        
        // Only count projects created within the last year
        if (creationDate >= oneYearAgo) {
          // Calculate which month this project belongs to
          const monthsDiff = 
            (creationDate.getFullYear() - oneYearAgo.getFullYear()) * 12 + 
            creationDate.getMonth() - oneYearAgo.getMonth();
          
          if (monthsDiff >= 0 && monthsDiff < 12) {
            // Increment the count for this month
            monthData[monthsDiff]++;
          }
        }
      });
      
      setProjectsData(monthData);
    } else {
      // Set default data for empty projects array
      setProjectsData(Array(12).fill(0));
    }
  }, [projects, monthlyLabels]);
  
  // Calculate monthly income data based on real invoice data
  useEffect(() => {
    if (invoices.length > 0 && monthlyLabels.length > 0) {
      // Get current date and calculate date 12 months ago
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      oneYearAgo.setMonth(currentDate.getMonth() + 1); // Start from the same month last year
      oneYearAgo.setDate(1); // Start from the 1st day of the month
      
      // Initialize array to sum invoice amounts per month
      const monthData = Array(12).fill(0);
      
      // Sum invoice amounts for each month
      invoices.forEach(invoice => {
        // Handle different date formats (both "created_at" and "createdAt")
        const creationDateStr = invoice.created_at || invoice.createdAt;
        if (!creationDateStr) return;
        
        const creationDate = new Date(creationDateStr);
        
        // Only count invoices created within the last year
        if (creationDate >= oneYearAgo) {
          // Calculate which month this invoice belongs to
          const monthsDiff = 
            (creationDate.getFullYear() - oneYearAgo.getFullYear()) * 12 + 
            creationDate.getMonth() - oneYearAgo.getMonth();
          
          if (monthsDiff >= 0 && monthsDiff < 12) {
            // Get the invoice amount (handle different property names and convert to number)
            const amount = parseFloat(invoice.amount || invoice.total || 0);
            
            // Add this invoice amount to the month's total
            monthData[monthsDiff] += amount;
          }
        }
      });
      
      // Round amounts to whole numbers for cleaner display
      const roundedMonthData = monthData.map(amount => Math.round(amount));
      
      setIncomeData(roundedMonthData);
    } else {
      // Set default data for empty invoices array
      setIncomeData(Array(12).fill(0));
    }
  }, [invoices, monthlyLabels]);
  
  // Calculate team distribution data based on team member roles
  useEffect(() => {
    if (teamMembers && teamMembers.length > 0) {
      // Count occurrences of each role
      const roleCount = {};
      
      teamMembers.forEach(member => {
        if (member.role) {
          // Capitalize first letter of role for consistent display
          const role = member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase();
          
          if (roleCount[role]) {
            roleCount[role]++;
          } else {
            roleCount[role] = 1;
          }
        }
      });
      
      // Convert to arrays for the chart
      const labels = [];
      const data = [];
      
      // Sort roles by count (descending) to show most common roles first
      Object.entries(roleCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Limit to top 5 roles for better visualization
        .forEach(([role, count]) => {
          labels.push(role);
          data.push(count);
        });
      
      setTeamDistributionLabels(labels);
      setTeamDistributionData(data);
    } else {
      // Set default values for empty data
      setTeamDistributionLabels(['No Data']);
      setTeamDistributionData([1]);
    }
  }, [teamMembers]);
  
  // Mock data for stats
  const stats = [
    { title: 'Total Users', value: users.length || 0, icon: UsersIcon },
    { title: 'Total Projects', value: projects.length || 0, icon: BriefcaseIcon },
    { title: 'Total Teams', value: teams.length || 0, icon: UserGroupIcon },
    { title: 'Total Income', value: income || 0, icon: CurrencyDollarIcon },
  ];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded"></div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="space-y-3 w-full">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Skeleton - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      
      {/* Charts Skeleton - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

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
          title="Team Member Roles" 
          data={teamDistributionData} 
          labels={teamDistributionLabels} 
        />
      </div>
    </div>
  );
};

export default Overview; 