import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { BILLING_SERVICE_URL, PROJECT_SERVICE_URL, USER_SERVICE_URL } from "../../constants";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [income, setIncome] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Add loading states for each data type
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(true);

  const getUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(`${USER_SERVICE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const getProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await axios.get(`${PROJECT_SERVICE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const getTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await axios.get(`${PROJECT_SERVICE_URL}/api/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setTeams(response.data.teams);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoadingTeams(false);
    }
  }

  const getPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoadingPlans(false);
    }
  }

  const getSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/subscriptions/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSubscriptions(response.data);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoadingSubscriptions(false);
    }
  }

  const getInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/invoices/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setInvoices(response.data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoadingInvoices(false);
    }
  }

  const getTeamMembers = async () => {
    try {
      setLoadingTeamMembers(true);
      const response = await axios.get(`${PROJECT_SERVICE_URL}/api/team-members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setTeamMembers(response.data.team_members);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoadingTeamMembers(false);
    }
  }
  

  useEffect(() => {
    if (token) {
      getUsers();
      getProjects();
      getTeams();
      getSubscriptions();
      getPlans();
      getInvoices();
      getTeamMembers();
    }
  }, [token]);

  useEffect(() => {
    if (invoices.length > 0) {
      let totalIncome = 0;
      invoices.forEach((invoice) => {
        totalIncome += +invoice.amount;
      });
      setIncome(totalIncome);
      setLoadingIncome(false);
    } else {
      // Set income to 0 if there are no invoices
      setIncome(0);
      setLoadingIncome(false);
    }
  }, [invoices]);

  const getUserById = (userId) => {
    return users.find((user) => user.id === userId);
  };

  const getPlanById = (planId) => {
    return plans.find((plan) => plan.id === planId);
  };

  const value = {
    users,
    projects,
    getUserById,
    teams,
    plans,
    subscriptions,
    getPlanById,
    invoices,
    income,
    teamMembers,
    // Expose loading states
    loadingUsers,
    loadingProjects,
    loadingTeams,
    loadingPlans,
    loadingSubscriptions,
    loadingInvoices,
    loadingIncome,
    loadingTeamMembers,
    // Setters
    setPlans,
    setSubscriptions,
    setInvoices,
    setUsers,
    setProjects,
    setTeams,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
