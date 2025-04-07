import { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !user?.id) return;
      
      if ((globalChatRooms.length > 0 && Object.keys(globalUsers).length > 0) || apiCallInProgressRef.current) {
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
    };
    
    fetchData();
  }, [token, user?.id, teams]);

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

  return { chatRooms, users, loading, updateChatRooms };
} 