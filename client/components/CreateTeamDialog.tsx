import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PROJECT_SERVICE_URL } from '@/constants/API_URLS';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { addTeam } from '@/lib/features/TeamsSlice';

// Instead of being self-contained with its own trigger, the component accepts props
interface CreateTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({ open, onOpenChange }) => {
  const { token, user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    user_id: user?.id,
  });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(PROJECT_SERVICE_URL + '/api/teams', formData, {
        headers: {
          Authorization: "Bearer " + token,
        }
      });

      if (response.status !== 201) {
        toast.error("Failed to create team. Please try again.");
        dispatch(addTeam(response.data));
        return;
      }

      toast.success(`Team "${formData.name}" has been created.`);
      onOpenChange(false);
      setFormData({ name: '', description: '', user_id: user?.id });

    } catch (error) {
      toast.error("Failed to create team. Please try again.");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Team</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a team to collaborate with your colleagues
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Team Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Team description"
              className="w-full min-h-24"
              required
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4 flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-0"
            >
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamDialog;