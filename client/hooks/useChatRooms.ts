import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { ChatRoom, User } from '@/types';
import axios from 'axios';
import { CHAT_SERVICE_URL, USERS_SERVICE_URL } from '@/constants/API_URLS';

// Create a global cache for chat rooms and users
let globalChatRooms: ChatRoom[] = [];
let globalUsers: Record<string, User> = {};
let isInitialFetchDone = false;

export function useChatRooms() {
  const { user, token } = useSelector((state: RootState) => state.user);
  const { teams } = useSelector((state: RootState) => state.teams);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(globalChatRooms);
  const [users, setUsers] = useState<Record<string, User>>(globalUsers);
  const [loading, setLoading] = useState(!isInitialFetchDone);
  const apiCallInProgressRef = useRef(false);

  // Add a function to fetch chat rooms that can be called manually
  const fetchChatRooms = useCallback(async (forceRefresh = false) => {
    if (!token || !user?.id) return;
    
    // If not forcing refresh and we already have data and a call is not in progress, return
    if (!forceRefresh && ((globalChatRooms.length > 0 && Object.keys(globalUsers).length > 0) || apiCallInProgressRef.current)) {
      setLoading(false);
      return;
    }
    
    apiCallInProgressRef.current = true;
    setLoading(true);
    
    try {
      console.log('Fetching chat rooms and users...');
      
      // 1. First collect all user IDs from teams
      const userIds = new Set<string>();
      
      teams.forEach(team => {
        if (team.members && team.members.length > 0) {
          team.members.forEach(member => {
            if (member.user_id !== user.id) { // Exclude current user
              userIds.add(member.user_id);
            }
          });
        }
      });
      
      // 2. Fetch chat rooms
      const roomsResponse = await axios.get(`${CHAT_SERVICE_URL}/api/chat-rooms/by-user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (roomsResponse.status === 200) {
        const rooms = roomsResponse.data;
        globalChatRooms = rooms;
        setChatRooms(rooms);
        
        // Add participant IDs to the set of users to fetch
        rooms.forEach((room: ChatRoom) => {
          if (room.participants) {
            room.participants.forEach((participantId: string) => {
              userIds.add(participantId);
            });
          }
          
          if (room.lastMessage && room.lastMessage.senderId) {
            userIds.add(room.lastMessage.senderId);
          }
        });
        
        // 3. Fetch all users in a single batch request
        if (userIds.size > 0) {
          const userResponse = await axios.post(
            `${USERS_SERVICE_URL}/api/users/batch`,
            Array.from(userIds),
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (userResponse.status === 200) {
            const fetchedUsers = userResponse.data;
            const usersMap: Record<string, User> = {};
            
            fetchedUsers.forEach((fetchedUser: User) => {
              usersMap[fetchedUser.id] = fetchedUser;
            });
            
            globalUsers = usersMap;
            setUsers(usersMap);
          }
        }
      }
      
      isInitialFetchDone = true;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      apiCallInProgressRef.current = false;
    }
  }, [token, user?.id, teams]);

  // Use the fetchChatRooms function in the useEffect
  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  // Function to update chat rooms (e.g., when a new message arrives)
  const updateChatRooms = (updaterOrRooms: ChatRoom[] | ((prev: ChatRoom[]) => ChatRoom[])) => {
    if (typeof updaterOrRooms === 'function') {
      const newRooms = updaterOrRooms(chatRooms);
      
      if (JSON.stringify(newRooms) !== JSON.stringify(chatRooms)) {
        globalChatRooms = [...newRooms];
        setChatRooms([...newRooms]);
      }
    } else {
      globalChatRooms = [...updaterOrRooms];
      setChatRooms([...updaterOrRooms]);
    }
  };

  // Add this function to fetch user data for a specific user ID
  const fetchUserData = async (userId: string) => {
    if (!token || !userId) return null;
    
    try {
      const response = await axios.get(`${USERS_SERVICE_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        const userData = response.data;
        // Update the global users cache
        globalUsers[userId] = userData;
        setUsers(prevUsers => ({
          ...prevUsers,
          [userId]: userData
        }));
        return userData;
      }
    } catch (error) {
      console.error(`Error fetching user data for ID ${userId}:`, error);
    }
    return null;
  };

  return { 
    chatRooms, 
    users, 
    loading, 
    updateChatRooms, 
    fetchUserData,
    fetchChatRooms  // Export the fetchChatRooms function
  };
} 