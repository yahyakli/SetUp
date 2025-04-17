"use client";

import { BILLING_SERVICE_URL, NOTIFICATION_SERVICE_URL, PROJECT_SERVICE_URL, TASK_SERVICE_URL } from "@/constants/API_URLS";
import { initInvitations } from "@/lib/features/InvitationsSlice";
import { initNotifications } from "@/lib/features/NotificationsSlice";
import { initProjects, setProjectLoading } from "@/lib/features/ProjectsSlice";
import { initTasks } from "@/lib/features/TasksSlice";
import { initTeams, setTeamsLoading } from "@/lib/features/TeamsSlice";
import { fetchUser } from "@/lib/features/userSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { Message, Plan, Subscription, userPermissions, Team, Project } from "@/types/index";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Define the context type
type AppContextType = {
  isLoading: boolean;
  authCheckComplete: boolean;
  isAuthenticated: boolean;
  lastMessages: Record<string, Message>;
  updateLastMessage: (roomId: string, message: Message) => void;
  markLastMessageAsRead: (roomId: string, messageId: string) => void;
  plans: Plan[] | null;
  plansLoading: boolean;
  userSubscription: Subscription | null;
  userPermissions: userPermissions | null;
  setUserPermissions: (permissions: userPermissions) => void;
  setUserSubscription: (subscription: Subscription | null) => void;
};

// Create the context with default values
const AppContext = createContext<AppContextType>({
  isLoading: true,
  authCheckComplete: false,
  isAuthenticated: false,
  lastMessages: {},
  updateLastMessage: () => { },
  markLastMessageAsRead: () => { },
  plans: null,
  plansLoading: false,
  userSubscription: null,
  userPermissions: null,
  setUserPermissions: () => { },
  setUserSubscription: () => { }
});

// Custom hook to use the AppContext
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isLoading: userLoading, user } = useSelector((state: RootState) => state.user);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [plansLoading, setPlansLoading] = useState<boolean>(true);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [userPermissions, setUserPermissions] = useState<userPermissions | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(true);

  // Function to update the last message for a chat room
  const updateLastMessage = (roomId: string, message: Message) => {
    setLastMessages(prev => ({
      ...prev,
      [roomId]: message
    }));
  };

  // Function to mark a last message as read
  const markLastMessageAsRead = (roomId: string, messageId: string) => {
    setLastMessages(prev => {
      // Only update if the message ID matches the last message for this room
      if (prev[roomId] && prev[roomId]._id === messageId) {
        // Create a new message object with updated readBy array
        const updatedMessage = {
          ...prev[roomId],
          readBy: [
            ...(prev[roomId].readBy || []),
            { userId: user?.id || '', readAt: new Date() }
          ]
        };

        return {
          ...prev,
          [roomId]: updatedMessage
        };
      }
      return prev;
    });
  };

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
    getPlans();
    if (user?.id && token) {
      initTeamsFunc();
      initProjectFunc();
      getUserInvitations();
      getUserTasks();
      getUserNotifications();
    }
  }, [user?.id, token]);

  // Teams initialization with permission limits
  const initTeamsFunc = async () => {
    dispatch(setTeamsLoading(true));
    try {
      const res = await axios.get(PROJECT_SERVICE_URL + '/api/teams/member/' + user?.id, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        let teams = res.data.teams;
        
        // Apply permission limits if needed
        if (userPermissions && userPermissions.teams !== -1) {
          // Sort by updated_at before limiting
          teams = teams
            .sort((a: Team, b: Team) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, userPermissions.teams);
        }
        
        dispatch(initTeams(teams));
      }
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(setTeamsLoading(false));
    }
  };

  // Projects initialization with permission limits
  const initProjectFunc = async () => {
    dispatch(setProjectLoading(true));
    try {
      const res = await axios.get(PROJECT_SERVICE_URL + "/api/projects/user-with-teams/" + user?.id, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (res.status === 200) {
        let projects = res.data.projects;
        
        // Apply permission limits if needed
        if (userPermissions && userPermissions.projects !== -1) {
          // Sort by updated_at before limiting
          projects = projects
            .sort((a: Project, b: Project) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, userPermissions.projects);
        }
        
        dispatch(initProjects(projects));
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
      const res = await axios.get(NOTIFICATION_SERVICE_URL + "/api/invitations/user/" + user?.id, {
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

      if (res.status === 200) {
        dispatch(initTasks(res.data.data));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getUserNotifications = async () => {
    try {
      const res = await axios.get(NOTIFICATION_SERVICE_URL + "/api/notifications/user/" + user?.id, {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (res.status === 200) {
        dispatch(initNotifications(res.data));
      }
    } catch (err) {
      console.log(err);
    }
  }

  const getPlans = async () => {
    setPlansLoading(true);
    setPermissionsLoading(true);
    try {
      const res = await axios.get(BILLING_SERVICE_URL + "/api/plans/active");

      if (res.status === 200) {
        setPlans(res.data.plans);
      }

      // Only fetch subscription if user is logged in
      if (user?.id && token) {
        const usrRes = await axios.get(BILLING_SERVICE_URL + "/api/subscriptions/user/" + user?.id + "/active", {
          headers: { Authorization: "Bearer " + token }
        });

        if (usrRes.status === 200) {
          if (usrRes.data.subscription) {
            // Convert end_date string to Date object for comparison
            const endDate = new Date(usrRes.data.subscription.end_date);
            const currentDate = new Date();
            
            if (endDate > currentDate) {
              setUserSubscription(usrRes.data.subscription);
              setUserPermissions({
                projects: usrRes.data.subscription.plan.projects,
                teams: usrRes.data.subscription.plan.teams,
                chat: usrRes.data.subscription.plan.chat,
                priority: usrRes.data.subscription.plan.priority,
                analytics: usrRes.data.subscription.plan.analytics,
                security: usrRes.data.subscription.plan.security,
              });
            } else {
              // Subscription has expired - set default permissions
              setUserSubscription(null);
              setUserPermissions({
                projects: 3,
                teams: 1,
                chat: false,
                priority: false,
                analytics: false,
                security: false,
              });
            }
          } else {
            // No subscription - set default permissions
            setUserPermissions({
              projects: 3,
              teams: 1,
              chat: false,
              priority: false,
              analytics: false,
              security: false,
            });
          }
        }
      } else {
        // Set default permissions for non-authenticated users
        setUserPermissions({
          projects: 3,
          teams: 1,
          chat: false,
          priority: false,
          analytics: false,
          security: false,
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setPlansLoading(false);
      setPermissionsLoading(false);
    }
  }

  // Calculate the overall loading state
  const isLoading = userLoading || !authCheckComplete || (!!user?.id && (plansLoading || permissionsLoading));

  // Context value
  const contextValue: AppContextType = {
    isLoading,
    authCheckComplete,
    isAuthenticated: !!token,
    lastMessages,
    updateLastMessage,
    markLastMessageAsRead,
    plans,
    plansLoading,
    userSubscription,
    userPermissions,
    setUserPermissions,
    setUserSubscription
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
