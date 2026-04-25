"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import axios from 'axios';
import { BILLING_SERVICE_URL } from '@/constants/API_URLS';
import { Message, Plan, Subscription, userPermissions as UserPermissions } from '@/types';

interface AppContextType {
  authCheckComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  userSubscription: Subscription | null;
  userPermissions: UserPermissions;
  setUserSubscription: React.Dispatch<React.SetStateAction<Subscription | null>>;
  setUserPermissions: React.Dispatch<React.SetStateAction<UserPermissions>>;
  plans: Plan[];
  plansLoading: boolean;
  lastMessages: Record<string, Message>;
  updateLastMessage: (roomId: string, message: Message) => void;
  markLastMessageAsRead: (roomId: string, userId: string) => void;
}

const defaultPermissions: UserPermissions = {
  projects: 2, // Default free limit
  teams: 1,    // Default free limit
  chat: false,
  priority: false,
  analytics: false,
  security: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useSelector((state: RootState) => state.user);
  
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>(defaultPermissions);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});

  const fetchUserSubscription = useCallback(async () => {
    if (!token || !user) {
      setAuthCheckComplete(true);
      return;
    }

    try {
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/subscriptions/current/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.subscription) {
        const sub = response.data.subscription;
        setUserSubscription(sub);
        
        // Update permissions based on plan
        if (sub.plan) {
          setUserPermissions({
            projects: sub.plan.projects,
            teams: sub.plan.teams,
            chat: !!sub.plan.chat,
            priority: !!sub.plan.priority,
            analytics: !!sub.plan.analytics,
            security: !!sub.plan.security,
          });
        }
      } else {
        // Fallback to free plan permissions if no subscription found
        setUserSubscription(null);
        setUserPermissions(defaultPermissions);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setUserPermissions(defaultPermissions);
    } finally {
      setAuthCheckComplete(true);
    }
  }, [token, user]);

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/plans`);
      if (response.data && response.data.plans) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserSubscription();
    } else if (!authLoading) {
      setAuthCheckComplete(true);
      setUserSubscription(null);
      setUserPermissions(defaultPermissions);
    }
  }, [isAuthenticated, user, authLoading, fetchUserSubscription]);

  const updateLastMessage = useCallback((roomId: string, message: Message) => {
    setLastMessages(prev => ({
      ...prev,
      [roomId]: message
    }));
  }, []);

  const markLastMessageAsRead = useCallback((roomId: string, userId: string) => {
    setLastMessages(prev => {
      const message = prev[roomId];
      if (!message) return prev;

      // Check if user already in readBy
      const alreadyRead = message.readBy.some(read => 
        (typeof read === 'object' ? read.userId : read) === userId
      );

      if (alreadyRead) return prev;

      return {
        ...prev,
        [roomId]: {
          ...message,
          readBy: [...message.readBy, { userId, readAt: new Date() }]
        }
      };
    });
  }, []);

  const value = {
    authCheckComplete,
    isAuthenticated,
    isLoading: authLoading,
    userSubscription,
    userPermissions,
    setUserSubscription,
    setUserPermissions,
    plans,
    plansLoading,
    lastMessages,
    updateLastMessage,
    markLastMessageAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
