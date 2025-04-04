import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Users, User as UserIcon } from 'lucide-react'

interface NewChatDialogProps {
  isOpen: boolean
  onClose: () => void
}

// Fake users for testing
const fakeUsers = [
  { id: 'user1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', avatar: '' },
  { id: 'user2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', avatar: '' },
  { id: 'user3', firstName: 'Robert', lastName: 'Johnson', email: 'robert@example.com', avatar: '' },
  { id: 'user4', firstName: 'Emily', lastName: 'Williams', email: 'emily@example.com', avatar: '' },
  { id: 'user5', firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', avatar: '' },
]

// Fake projects for testing
const fakeProjects = [
  { id: 1, name: 'Website Redesign' },
  { id: 2, name: 'Mobile App Development' },
  { id: 3, name: 'Marketing Campaign' },
  { id: 4, name: 'Product Launch' },
]

export default function NewChatDialog({ isOpen, onClose }: NewChatDialogProps) {
  const [activeTab, setActiveTab] = useState('direct')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [groupName, setGroupName] = useState('')

  const filteredUsers = fakeUsers.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleCreateChat = () => {
    // In a real app, this would call an API to create a new chat
    console.log('Creating new chat:', {
      type: activeTab,
      users: selectedUsers,
      projectId: selectedProject,
      groupName
    })
    
    // Reset form and close dialog
    setSelectedUsers([])
    setSelectedProject('')
    setGroupName('')
    setSearchQuery('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new chat with team members or create a project chat.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Project Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select Users</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[200px] border rounded-md">
              <div className="p-2 space-y-1">
                {filteredUsers.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No users found</p>
                ) : (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
                    >
                      <Checkbox 
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.firstName.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Label 
                          htmlFor={`user-${user.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {user.firstName} {user.lastName}
                        </Label>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="project" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="project">Select Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {fakeProjects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-name">Chat Name (Optional)</Label>
              <Input
                id="group-name"
                placeholder="Enter a name for this chat"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If left blank, the project name will be used
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleCreateChat}
            disabled={(activeTab === 'direct' && selectedUsers.length === 0) || 
                     (activeTab === 'project' && !selectedProject)}
          >
            Create Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 