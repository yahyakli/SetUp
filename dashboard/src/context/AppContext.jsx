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
  // const [invoices, setInvoices] = useState([]);
  // const [income, setIncome] = useState([]);
  
  // Add loading states for each data type
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

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
        console.log(response.data.plans);
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

  useEffect(() => {
    if (token) {
      getUsers();
      getProjects();
      getTeams();
      getSubscriptions();
      getPlans();
    }
  }, [token]);

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
    // Expose loading states
    loadingUsers,
    loadingProjects,
    loadingTeams,
    loadingPlans,
    loadingSubscriptions,
    // Add refresh functions to allow manual data refresh
    refreshUsers: getUsers,
    refreshProjects: getProjects,
    refreshTeams: getTeams,
    refreshPlans: getPlans,
    refreshSubscriptions: getSubscriptions,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
