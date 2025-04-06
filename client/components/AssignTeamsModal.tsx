import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import axios from 'axios'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { PROJECT_SERVICE_URL } from '@/constants/API_URLS'
import { addTeamToProject } from '@/lib/features/ProjectsSlice'
import { Team } from '@/types'
import { toast } from 'sonner'

interface AssignTeamsModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
}

export default function AssignTeamsModal({
  isOpen,
  onClose,
  projectId,
}: AssignTeamsModalProps) {
  const dispatch = useDispatch()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const { teams } = useSelector((state: RootState) => state.teams)
  const { token } = useSelector((state: RootState) => state.user)

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAssignTeam = async (teamId: number) => {
    try {
      setIsAssigning(true)
      const res = await axios.post(PROJECT_SERVICE_URL + '/api/projects/assign-team', {
        project_id: projectId,
        team_id: teamId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 200) {
        toast.success('Team assigned successfully');
        dispatch(addTeamToProject({ projectId, team: filteredTeams.find(team => team.id === teamId) as Team }));
        onClose()
      }
    } catch (error) {
      console.error('Error assigning team:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Assign Teams</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent"
            >
              <div>
                <h4 className="font-medium">{team.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1 pr-5 min-h-[1.25rem]">{team.description}</p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAssignTeam(team.id)}
                disabled={isAssigning}
              >
                Assign
              </Button>
            </div>
          ))}
          {filteredTeams.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No teams found
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 