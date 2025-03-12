"use client"

import React, { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, X, Plus, CheckCircle, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { USERS_SERVICE_URL, PROJECT_SERVICE_URL } from '@/constants/API_URLS'
import { User } from '@/types'
import UserAvatar from '@/components/UserAvatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InviteMembersModalProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  existingMembers: string[]; // Array of existing member IDs to exclude from results
  onMemberAdded: () => void; // Callback to refresh team data after adding a member
}

interface SelectedUserWithRole extends User {
  role: string;
}

const roleOptions = [
  { value: 'leader', label: 'Leader' },
  { value: 'manager', label: 'Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'tester', label: 'Tester' },
  { value: 'designer', label: 'Designer' }
];

const InviteMembersModal: React.FC<InviteMembersModalProps> = ({
  teamId,
  isOpen,
  onClose,
  token,
  existingMembers,
  onMemberAdded
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUserWithRole[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
    }
  }, [isOpen]);

  useEffect(() => {
    // Live search with debouncing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await axios.get(
            `${USERS_SERVICE_URL}/api/users/search/${encodeURIComponent(searchQuery)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (response.status === 200) {
            const filteredResults = response.data.filter(
              (user: User) => !existingMembers.includes(user.id)
            );
            setSearchResults(filteredResults);
          }
        } catch (error) {
          console.error('Error searching users:', error);
          toast.error('Failed to search users');
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, token, existingMembers]);

  const handleSelectUser = (user: User) => {
    if (selectedUsers.some(selected => selected.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(selected => selected.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, { ...user, role: 'developer' }]); // Default role
    }
  };

  const handleRoleChange = (userId: string, role: string) => {
    setSelectedUsers(selectedUsers.map(user =>
      user.id === userId ? { ...user, role } : user
    ));
  };

  const handleInviteMembers = async () => {
    if (selectedUsers.length === 0) return;

    setIsSubmitting(true);

    try {
      const promises = selectedUsers.map(user =>
        axios.post(
          `${PROJECT_SERVICE_URL}/api/teams/add-member`,
          {
            team_id: teamId,
            user_id: user.id,
            role: user.role
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      );

      await Promise.all(promises);

      toast.success(`Successfully added ${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''}`);
      onMemberAdded();
      onClose();
    } catch (error) {
      console.error('Error inviting members:', error);
      toast.error('Failed to invite members');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Search and add users to your team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Selected users with role selection */}
          {selectedUsers.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium mb-2 block">Selected Users:</Label>
              <div className="space-y-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border rounded-md p-2 bg-muted/20"
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar user={user} />
                      <span>{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        onClick={() => handleSelectUser(user)}
                        className="hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          <div className="mt-4">
            {isSearching ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            ) : searchResults.length > 0 ? (
              <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
                {searchResults.map(user => {
                  const isSelected = selectedUsers.some(selected => selected.id === user.id);

                  return (
                    <div
                      key={user.id}
                      className={`p-3 flex items-center justify-between hover:bg-muted cursor-pointer ${isSelected ? 'bg-muted/50' : ''}`}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div>
                        {isSelected ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Plus className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInviteMembers}
            disabled={isSubmitting || selectedUsers.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMembersModal;