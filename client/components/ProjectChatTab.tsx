"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MessageSquare, Users, UserPlus } from 'lucide-react';
import { CHAT_SERVICE_URL } from '@/constants/API_URLS';
import axios from 'axios';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project, Team, TeamMember, ChatRoom } from '@/types';

interface ProjectChatTabProps {
  project: Project;
}

export default function ProjectChatTab({ project }: ProjectChatTabProps) {
  const { user, token } = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState(`${project.name} Chat`);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [status, setStatus] = useState<'NOT_FOUND' | 'NOT_PARTICIPANT' | 'SUCCESS' | null>(null);
  const router = useRouter();
  const isProjectOwner = project.owner_id === user?.id;

  useEffect(() => {
    if (user && project) {
      fetchChatRoom();
    }
  }, [user, project]);

  const fetchChatRoom = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${CHAT_SERVICE_URL}/api/chat-rooms/by-project/${project.id}/${user?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setStatus(response.data.status);
      
      if (response.data.ok) {
        setChatRoom(response.data.chatRoom);
      } else if (response.data.status === 'NOT_PARTICIPANT' && response.data.chatRoomId) {
        setChatRoomId(response.data.chatRoomId);
      }
    } catch (error) {
      console.error('Error fetching project chat room:', error);
      toast.error('Failed to fetch chat room information');
    } finally {
      setLoading(false);
    }
  };

  const createChatRoom = async () => {
    try {
      setCreating(true);
      
      // Get all team members from the project teams
      const participants = new Set<string>();
      
      // Add the current user
      if (user?.id) {
        participants.add(user.id);
      }
      
      // Add the project owner
      if (project.owner_id) {
        participants.add(project.owner_id.toString());
      }
      
      // Add team members from all teams in the project
      project.teams.forEach((team: Team) => {
        if (team.members) {
          team.members.forEach((member: TeamMember) => {
            participants.add(member.id.toString());
          });
        }
      });
      
      const payload = {
        type: 'project',
        name: roomName,
        projectId: project.id,
        participants: Array.from(participants),
        user_id: user?.id
      };

      const response = await axios.post(
        `${CHAT_SERVICE_URL}/api/chat-rooms`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setChatRoom(response.data);
      toast.success('Project chat room created successfully');
      
      // Navigate to the chat room
      router.push(`/chat/${response.data._id}`);
    } catch (error) {
      console.error('Error creating project chat room:', error);
      toast.error('Failed to create project chat room');
    } finally {
      setCreating(false);
    }
  };

  const joinChatRoom = async () => {
    if (!chatRoomId) return;
    
    try {
      setJoining(true);
      
      const response = await axios.post(
        `${CHAT_SERVICE_URL}/api/chat-rooms/${chatRoomId}/participants`,
        { userId: user?.id },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      if (response.status === 200) {
        toast.success('Successfully joined the chat room');
        // Navigate to the chat room
        router.push(`/chat/${chatRoomId}`);
      } else {
        toast.error('Failed to join the chat room');
      }
    } catch (error) {
      console.error('Error joining chat room:', error);
      toast.error('Failed to join the chat room');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Case 3: Chat room exists and user is a participant
  if (status === 'SUCCESS' && chatRoom) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {chatRoom.name}
          </CardTitle>
          <CardDescription>
            Project chat room for team communication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {chatRoom.participants.length} participants
            </span>
          </div>
          
          <div className="flex justify-center mt-4">
            <Link href={`/chat/${chatRoom._id}`}>
              <Button className="w-full md:w-auto">
                Open Chat Room
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Case 2: Chat room exists but user is not a participant
  if (status === 'NOT_PARTICIPANT' && chatRoomId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Join Project Chat Room</CardTitle>
          <CardDescription>
            This project has a chat room, but you&apos;re not a participant yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Join the chat room to communicate with the project team members.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={joinChatRoom} 
            disabled={joining} 
            className="w-full"
          >
            {joining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Join Chat Room
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Case 1: No chat room exists
  // For owner: Allow creation
  if (status === 'NOT_FOUND' && isProjectOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Project Chat Room</CardTitle>
          <CardDescription>
            Set up a chat room for this project to facilitate team communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chat Room Name</label>
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter chat room name"
              />
            </div>
            
            <Button 
              onClick={createChatRoom} 
              disabled={creating || !roomName.trim()} 
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Create Chat Room
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Case 1: No chat room exists
  // For non-owner: Show message
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Chat Room Available</CardTitle>
        <CardDescription>
          This project doesn&apos;t have a chat room yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Only the project owner can create a chat room for this project. Please contact the project owner to request a chat room.
        </p>
      </CardContent>
    </Card>
  );
} 