"use client";

import { PROJECT_SERVICE_URL, TASK_SERVICE_URL } from "@/constants/API_URLS";
import { initInvitations } from "@/lib/features/InvitationsSlice";
import { initProjects, setProjectLoading } from "@/lib/features/ProjectsSlice";
import { initTasks } from "@/lib/features/TasksSlice";
import { initTeams, setTeamsLoading } from "@/lib/features/TeamsSlice";
import { fetchUser } from "@/lib/features/userSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { Team } from "@/types";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Define the context type
type AppContextType = {
  isLoading: boolean;
  authCheckComplete: boolean;
  isAuthenticated: boolean;
};

// Create the context with default values
const AppContext = createContext<AppContextType>({
  isLoading: true,
  authCheckComplete: false,
  isAuthenticated: false,
});

// Custom hook to use the AppContext
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isLoading, user } = useSelector((state: RootState) => state.user);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Check authentication status
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      if (token) {
        dispatch(fetchUser())
          .finally(() => {
            setAuthCheckComplete(true);
          });
      } else {
        setAuthCheckComplete(true);
      }
    }
  }, [dispatch, token]);

  // Initialize data when user is authenticated
  useEffect(() => {
    if (user?.id && token) {
      initTeamsFunc();
      initProjectFunc();
      getUserInvitations();
      getUserTasks();
    }
  }, [user?.id, token]);

  // Teams initialization
  const initTeamsFunc = async () => {
    dispatch(setTeamsLoading(true));
    try {
      const res = await axios.get(PROJECT_SERVICE_URL + '/api/teams/member/' + user?.id, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        const teams: Team[] = res.data.teams;
        dispatch(initTeams(teams));
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setTeamsLoading(false));
    }
  };

  // Projects initialization
  const initProjectFunc = async () => {
    dispatch(setProjectLoading(true));
    try {
      const res = await axios.get(PROJECT_SERVICE_URL + "/api/projects/user-with-teams/" + user?.id, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (res.status === 200) {
        dispatch(initProjects(res.data.projects));
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setProjectLoading(false));
    }
  };

  // Get user invitations
  const getUserInvitations = async () => {
    try {
      const res = await axios.get(PROJECT_SERVICE_URL + "/api/invitations/user/" + user?.id, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (res.status === 200) {
        dispatch(initInvitations(res.data));
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Get user tasks
  const getUserTasks = async () => {
    try {
      const res = await axios.get(TASK_SERVICE_URL + "/api/tasks/user/" + user?.id, {
        headers: {
          Authorization: "Bearer " + token
        }
      });
      
      if(res.status === 200){
        dispatch(initTasks(res.data.data));
      }
    } catch(err) {
      console.log(err);
    }
  };

  // Context value
  const contextValue: AppContextType = {
    isLoading,
    authCheckComplete,
    isAuthenticated: !!token
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
