import { 
  UsersIcon, BriefcaseIcon, UserGroupIcon, CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
import StatCard from '../../components/dashboard/StatCard';
import LineChart from '../../components/dashboard/LineChart';
import BarChart from '../../components/dashboard/BarChart';
import PieChart from '../../components/dashboard/PieChart';
import { useApp } from '../../context/AppContext';
import { useEffect, useState, useRef } from 'react';
import { Switch } from '@headlessui/react';

const Overview = () => {
  const { users, loadingUsers, projects, loadingProjects, teams, loadingTeams, income, loadingIncome, invoices, loadingInvoices, teamMembers, loadingTeamMembers } = useApp();
  const [loading, setLoading] = useState(true);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [monthlyLabels, setMonthlyLabels] = useState([]);
  const [teamDistributionLabels, setTeamDistributionLabels] = useState([]);
  const [teamDistributionData, setTeamDistributionData] = useState([]);
  const [useFakeData, setUseFakeData] = useState(false);
  const [fakeUserGrowthData, setFakeUserGrowthData] = useState([]);
  const [fakeProjectsData, setFakeProjectsData] = useState([]);
  const [fakeIncomeData, setFakeIncomeData] = useState([]);
  const [fakeStats, setFakeStats] = useState([
    { title: 'Total Users', value: 0, icon: UsersIcon },
    { title: 'Total Projects', value: 0, icon: BriefcaseIcon },
    { title: 'Total Teams', value: 0, icon: UserGroupIcon },
    { title: 'Total Income', value: 0, icon: CurrencyDollarIcon },
  ]);
  const fakeDataGenerated = useRef(false);
  
  // Use either real or fake data based on the switch
  const dataUsers = users;
  const dataProjects = projects;
  const dataInvoices = invoices;
  const dataTeamMembers = teamMembers;
  useEffect(() => {
    if (useFakeData) {
      setLoading(false);
    } else {
      setLoading(loadingUsers || loadingProjects || loadingTeams || loadingIncome || loadingInvoices || loadingTeamMembers);
    }
  }, [useFakeData, loadingUsers, loadingProjects, loadingTeams, loadingIncome, loadingInvoices, loadingTeamMembers]);
  
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
  
  // Calculate user growth data based on real or fake user creation dates
  useEffect(() => {
    if (useFakeData) return;
    if (dataUsers.length > 0 && monthlyLabels.length > 0) {
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
      const sortedUsers = [...dataUsers].sort((a, b) => {
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
  }, [useFakeData, dataUsers, monthlyLabels]);
  
  // Calculate projects data based on real or fake project creation dates
  useEffect(() => {
    if (useFakeData) return;
    if (dataProjects.length > 0 && monthlyLabels.length > 0) {
      // Get current date and calculate date 12 months ago
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      oneYearAgo.setMonth(currentDate.getMonth() + 1); // Start from the same month last year
      oneYearAgo.setDate(1); // Start from the 1st day of the month
      
      // Initialize array to count projects per month
      const monthData = Array(12).fill(0);
      
      // Count projects created in each month
      dataProjects.forEach(project => {
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
  }, [useFakeData, dataProjects, monthlyLabels]);
  
  // Calculate monthly income data based on real or fake invoice data
  useEffect(() => {
    if (useFakeData) return;
    if (dataInvoices.length > 0 && monthlyLabels.length > 0) {
      // Get current date and calculate date 12 months ago
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      oneYearAgo.setMonth(currentDate.getMonth() + 1); // Start from the same month last year
      oneYearAgo.setDate(1); // Start from the 1st day of the month
      
      // Initialize array to sum invoice amounts per month
      const monthData = Array(12).fill(0);
      
      // Sum invoice amounts for each month
      dataInvoices.forEach(invoice => {
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
  }, [useFakeData, dataInvoices, monthlyLabels]);
  
  // Calculate team distribution data based on real or fake team member roles
  useEffect(() => {
    if (useFakeData) return;
    if (dataTeamMembers && dataTeamMembers.length > 0) {
      // Count occurrences of each role
      const roleCount = {};
      
      dataTeamMembers.forEach(member => {
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
  }, [useFakeData, dataTeamMembers]);
  
  // Helper to generate smooth random data
  function generateSmoothData(length, start, minStep, maxStep, min, max) {
    let arr = [start];
    for (let i = 1; i < length; i++) {
      let prev = arr[i - 1];
      let step = (Math.random() * (maxStep - minStep) + minStep) * (Math.random() > 0.5 ? 1 : -1);
      let next = Math.max(min, Math.min(max, Math.round(prev + step)));
      arr.push(next);
    }
    return arr;
  }

  // Generate fake data only once per fake mode session
  useEffect(() => {
    if (useFakeData && !fakeDataGenerated.current) {
      // User Growth: always increasing, but with some months flat or small jumps
      let userGrowth = [Math.floor(Math.random() * 10) + 10];
      for (let i = 1; i < 12; i++) {
        userGrowth.push(userGrowth[i - 1] + Math.floor(Math.random() * 15 + 5));
      }
      setFakeUserGrowthData(userGrowth);

      // Projects: up and down
      setFakeProjectsData(generateSmoothData(12, 5, 0, 5, 2, 20));

      // Income: up and down, but generally trending up
      let income = [Math.floor(Math.random() * 500) + 500];
      for (let i = 1; i < 12; i++) {
        let step = Math.floor(Math.random() * 500) * (Math.random() > 0.3 ? 1 : -1);
        let next = Math.max(500, income[i - 1] + step);
        income.push(next);
      }
      setFakeIncomeData(income);

      // Team distribution: random but fixed for session
      let teamDist = Array(5).fill(0).map(() => Math.floor(Math.random() * 10) + 1);

      // Stats: based on last values
      setFakeStats([
        { title: 'Total Users', value: userGrowth[11], icon: UsersIcon },
        { title: 'Total Projects', value: fakeProjectsData.length > 0 ? fakeProjectsData.reduce((a, b) => a + b, 0) : 100, icon: BriefcaseIcon },
        { title: 'Total Teams', value: teamDist.reduce((a, b) => a + b, 0), icon: UserGroupIcon },
        { title: 'Total Income', value: income.reduce((a, b) => a + b, 0), icon: CurrencyDollarIcon },
      ]);

      fakeDataGenerated.current = true;
    }
    if (!useFakeData) {
      fakeDataGenerated.current = false;
    }
  }, [useFakeData]);

  // Use static fake data or real calculated data for rendering
  const stats = useFakeData ? fakeStats : [
    { title: 'Total Users', value: users.length || 0, icon: UsersIcon },
    { title: 'Total Projects', value: projects.length || 0, icon: BriefcaseIcon },
    { title: 'Total Teams', value: teams.length || 0, icon: UserGroupIcon },
    { title: 'Total Income', value: income || 0, icon: CurrencyDollarIcon },
  ];
  const userGrowthChartData = useFakeData ? fakeUserGrowthData : userGrowthData;
  const projectsChartData = useFakeData ? fakeProjectsData : projectsData;
  const incomeChartData = useFakeData ? fakeIncomeData : incomeData;
  const teamDistLabels = useFakeData ? ['Developer', 'Designer', 'Manager', 'QA', 'DevOps'] : teamDistributionLabels;
  const teamDistData = useFakeData ? [10, 5, 3, 2, 1] : teamDistributionData;

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
      {/* Switch for real/fake data using Headless UI */}
      <div className="flex items-center mb-4">
        <Switch.Group>
          <div className="flex items-center space-x-3">
            <Switch
              checked={useFakeData}
              onChange={setUseFakeData}
              className={`${useFakeData ? 'bg-blue-600' : 'bg-gray-200'}
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${useFakeData ? 'translate-x-6' : 'translate-x-1'}
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <Switch.Label className="text-sm font-medium cursor-pointer">
              Show Demo Data (Full Charts)
            </Switch.Label>
          </div>
        </Switch.Group>
      </div>
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
          data={userGrowthChartData} 
          labels={monthlyLabels} 
        />
        <BarChart 
          title="Projects by Month" 
          data={projectsChartData} 
          labels={monthlyLabels} 
        />
      </div>
      
      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart 
          title="Monthly Income ($)" 
          data={incomeChartData} 
          labels={monthlyLabels} 
        />
        <PieChart 
          title="Team Member Roles" 
          data={teamDistData} 
          labels={teamDistLabels} 
        />
      </div>
    </div>
  );
};

export default Overview; 