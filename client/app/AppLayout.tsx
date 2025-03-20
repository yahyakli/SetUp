"use client";

import { Footer } from "@/components/Footer";
import Loader from "@/components/Loader";
import { Navbar } from "@/components/Navbar";
import { PROJECT_SERVICE_URL, TASK_SERVICE_URL } from "@/constants/API_URLS";
import { initInvitations } from "@/lib/features/InvitationsSlice";
import { initProjects, setProjectLoading } from "@/lib/features/ProjectsSlice";
import { initTasks } from "@/lib/features/TasksSlice";
import { initTeams, setTeamsLoading } from "@/lib/features/TeamsSlice";
import { fetchUser } from "@/lib/features/userSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { Team } from "@/types";
import axios from "axios";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isLoading, user } = useSelector((state: RootState) => state.user);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

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

  useEffect(() => {
    if (user?.id && token) {
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

      const initProjectFunc = async () => {
        dispatch(setProjectLoading(true));
        try {
          const res = await axios.get(PROJECT_SERVICE_URL + "/api/projects/user-with-teams/" + user.id, {
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
      }

      const getUserInvitations = async () => {
        try {
          const res = await axios.get(PROJECT_SERVICE_URL + "/api/invitations/user/" + user.id, {
            headers: {
              Authorization: "Bearer " + token
            }
          });

          if (res.status === 200) {
            console.log(res.data);
            dispatch(initInvitations(res.data));
          }
        } catch (err) {
          console.log(err);
        }
      }

      const getUserTasks = async () => {
        try {
          const res = await axios.get(TASK_SERVICE_URL + "/api/tasks/user/" + user.id, {
            headers: {
              Authorization: "Bearer " + token
            }
          });
          
          if(res.status === 200){
            dispatch(initTasks(res.data.data));
          }
        }catch(err){
          console.log(err);
        }
      }
      initTeamsFunc();
      initProjectFunc();
      getUserInvitations();
      getUserTasks()
    }
  }, [user?.id]);

  // If we're on server-side or still loading user data, show loader
  if (typeof window === 'undefined' || isLoading || !authCheckComplete) {
    return <Loader />;
  }

  // Only redirect after auth check is complete and we're on client-side
  if (!token) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;