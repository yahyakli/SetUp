"use client"

import React, { useState, useEffect } from 'react'
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
import { AlertTriangle } from 'lucide-react'
import axios, { AxiosError } from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { PROJECT_SERVICE_URL } from '@/constants/API_URLS'
import { useDispatch } from 'react-redux'
import { deleteTeamInState } from '@/lib/features/TeamsSlice'

interface DeleteTeamModalProps {
  teamId: number;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
}

const DeleteTeamModal: React.FC<DeleteTeamModalProps> = ({
  teamId,
  teamName,
  isOpen,
  onClose,
  token
}) => {
  const router = useRouter();
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [confirmationInput, setConfirmationInput] = useState<string>('');
  const dispatch = useDispatch();

  // Generate a random 8-character code when the modal opens
  useEffect(() => {
    if (isOpen) {
      generateRandomCode();
      setConfirmationInput('');
    }
  }, [isOpen]);

  const generateRandomCode = (): void => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setGeneratedCode(result);
  };

  const handleDeleteTeam = async (): Promise<void> => {
    if (confirmationInput !== generatedCode) {
      toast.error('Confirmation code does not match');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await axios.delete(
        `${PROJECT_SERVICE_URL}/api/teams/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Team deleted successfully');
        dispatch(deleteTeamInState(teamId));
        onClose();
        router.push('/teams');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
          'Failed to delete team. Please try again.'
        );
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Delete Team
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            <span className="font-semibold"> {teamName} </span>
            team and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-amber-800 dark:text-amber-300 text-sm">
              To confirm, please enter the following code:
              <span className="font-mono font-bold block mt-1 text-center text-base">
                {generatedCode}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation-code">Confirmation Code</Label>
            <Input
              id="confirmation-code"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Enter the confirmation code"
              className="font-mono"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteTeam}
            disabled={isDeleting || confirmationInput !== generatedCode}
          >
            {isDeleting ? 'Deleting...' : 'Delete Team'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTeamModal;