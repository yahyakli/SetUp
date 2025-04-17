import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Loader2, Search, MessageSquare } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import axios from 'axios';
import { USERS_SERVICE_URL, CHAT_SERVICE_URL } from '@/constants/API_URLS';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChatRoom } from '@/types';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRooms: ChatRoom[];
}

export default function UserSelectionModal({ isOpen, onClose, chatRooms }: UserSelectionModalProps) {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.user);
  const { teams } = useSelector((state: RootState) => state.teams);
  
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  
  useEffect(() => {
    if (searchQuery) {
      setFilteredUsers(
        teamUsers.filter(user => 
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(teamUsers);
    }
  }, [searchQuery, teamUsers]);
  
  const fetchTeamUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Extract all user IDs from teams
      const userIds = new Set<string>();
      
      teams.forEach(team => {
        if (team.members && team.members.length > 0) {
          team.members.forEach(member => {
            if (member.user_id !== user?.id) { // Exclude current user
              userIds.add(member.user_id);
            }
          });
        }
      });
      
      // If no team members found
      if (userIds.size === 0) {
        setTeamUsers([]);
        setFilteredUsers([]);
        setLoading(false);
        return;
      }
      
      // Fetch user details
      const response = await axios.post(
        `${USERS_SERVICE_URL}/api/users/batch`,
        Array.from(userIds),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        // Filter out users who already have a direct chat with the current user
        const usersWithExistingChats = new Set<string>();
        
        // Find all direct chat participants
        chatRooms.forEach(room => {
          if (room.type === 'direct' && room.participants.includes(user?.id || '')) {
            // Get the other participant's ID
            const otherParticipantId = room.participants.find(id => id !== user?.id);
            if (otherParticipantId) {
              usersWithExistingChats.add(otherParticipantId);
            }
          }
        });
        
        // Filter out users who already have a chat
        const filteredTeamUsers = response.data.filter(
          (teamUser: User) => !usersWithExistingChats.has(teamUser.id)
        );
        
        setTeamUsers(filteredTeamUsers);
        setFilteredUsers(filteredTeamUsers);
      }
    } catch (error) {
      console.error('Error fetching team users:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, [teams, user, token, chatRooms, setTeamUsers, setFilteredUsers]);

  useEffect(() => {
    if (isOpen && teams.length > 0) {
      fetchTeamUsers();
    }
  }, [isOpen, teams, fetchTeamUsers]);
  
  const startConversation = async (selectedUser: User) => {
    if (!user?.id || !selectedUser.id) return;
    
    setCreatingChat(true);
    try {
      const response = await axios.post(
        `${CHAT_SERVICE_URL}/api/chat-rooms`,
        {
          type: 'direct',
          participants: [user.id, selectedUser.id],
          user_id: user.id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 201 || response.status === 200) {
        toast.success(`Chat with ${selectedUser.firstName} started`);
        onClose();
        
        // Navigate to the chat room
        const chatRoomId = response.data.id || response.data._id;
        router.push(`/chat?room=${chatRoomId}`);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast.error('Failed to start conversation');
    } finally {
      setCreatingChat(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(teamUser => (
                <div 
                  key={teamUser.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => !creatingChat && startConversation(teamUser)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {teamUser.avatar ? (
                        <AvatarImage 
                          src={`${USERS_SERVICE_URL}${teamUser.avatar}`} 
                          alt={teamUser.firstName} 
                        />
                      ) : (
                        <AvatarFallback>
                          {teamUser.firstName?.[0]}{teamUser.lastName?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{teamUser.firstName} {teamUser.lastName}</p>
                      <p className="text-sm text-muted-foreground">{teamUser.email}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    disabled={creatingChat}
                    onClick={(e) => {
                      e.stopPropagation();
                      startConversation(teamUser);
                    }}
                  >
                    {creatingChat ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {teams.length === 0 
                  ? "You're not a member of any teams yet" 
                  : "No team members found"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 