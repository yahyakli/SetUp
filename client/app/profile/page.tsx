"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';
import {
  AlertTriangle,
  Camera,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  FormDescription,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RootState } from '@/lib/store';
import AppLayout from '../AppLayout';
import axios from 'axios';
import { USERS_SERVICE_URL } from '@/constants/API_URLS';
import { toast } from 'sonner';
import { logout, updateUser } from '@/lib/features/userSlice';

const Page = () => {
  const { user, token } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize useForm
  const methods = useForm();

  // State for forms
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userVerificationInput, setUserVerificationInput] = useState('');

  // State for avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use useEffect to initialize profileForm when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  // Generate verification code for account deletion
  const generateVerificationCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setVerificationCode(code);
    return code;
  };

  // Handler for profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  // Handler for password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Handler for avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);

    // Reset the file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the input value
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.put(`${USERS_SERVICE_URL}/api/users/${user?.id}`, profileForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        toast.success('Profile updated successfully');
        dispatch(updateUser(res.data));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar update
  const handleAvatarUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', avatarFile);

      const res = await axios.post(`${USERS_SERVICE_URL}/api/users/${user?.id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        toast.success('Avatar updated successfully');
        dispatch(updateUser(res.data));
        setAvatarPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Reset the input value
        }
      }
    } catch (error) {
      console.error('Avatar update error:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update avatar');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.patch(`${USERS_SERVICE_URL}/api/users/${user?.id}/password`, passwordForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (res.status === 200) {
        toast.success('Password updated successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Password update error:', error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;

        if (errorData && typeof errorData === 'object') {
          if (errorData.currentPassword) {
            toast.error(`Current Password: ${errorData.currentPassword}`);
          }
          if (errorData.newPassword) {
            toast.error(`New Password: ${errorData.newPassword}`);
          }
        } else {
          toast.error(errorData || 'Failed to update password');
        }
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (userVerificationInput !== verificationCode) {
      toast.error('Invalid verification code');
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.delete(`${USERS_SERVICE_URL}/api/users/${user?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (res.status === 200) {
        toast.success('Account deleted successfully');
        setDeleteDialogOpen(false);
        dispatch(logout());
        // Redirect to login or home page
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete account');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const firstName = profileForm.firstName || user?.firstName || '';
    const lastName = profileForm.lastName || user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <AppLayout>
      <FormProvider {...methods}>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your profile information and avatar
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Avatar Section */}
                      <div className="flex flex-col items-center gap-3">
                        <Avatar className="h-24 w-24 border-2 border-primary/10">
                          <AvatarImage src={avatarPreview || (USERS_SERVICE_URL || '') + user?.avatar} />
                          <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
                        </Avatar>

                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="relative"
                            disabled={isLoading}
                          >
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleAvatarChange}
                                ref={fileInputRef}
                              />
                              <span className="flex items-center gap-1">
                                <Camera className="h-4 w-4 mr-1" />
                                Change
                              </span>
                            </label>
                          </Button>
                        </div>

                        {avatarPreview && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            className="hover:text-red-500"
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {/* Profile Form */}
                      <form onSubmit={handleProfileUpdate} className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <FormLabel htmlFor="firstName">First Name</FormLabel>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={profileForm.firstName}
                              onChange={handleProfileChange}
                              placeholder="John"
                              disabled={isLoading}
                            />
                          </div>

                          <div className="space-y-2">
                            <FormLabel htmlFor="lastName">Last Name</FormLabel>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={profileForm.lastName}
                              onChange={handleProfileChange}
                              placeholder="Doe"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <FormLabel htmlFor="email">Email</FormLabel>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            disabled
                            className="bg-muted"
                          />
                          <FormDescription>
                            Your email address is read-only and cannot be changed.
                          </FormDescription>
                        </div>
                      </form>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      type="submit"
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Profile Changes'}
                    </Button>
                    <Button
                      type="submit"
                      onClick={handleAvatarUpdate}
                      disabled={isLoading || !avatarFile}
                    >
                      {isLoading ? 'Saving...' : 'Save Avatar Changes'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                {/* Password Update Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password to maintain account security
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            disabled={isLoading}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FormLabel htmlFor="newPassword">New Password</FormLabel>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={isLoading}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <FormDescription>
                          Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                        </FormDescription>
                      </div>

                      <div className="space-y-2">
                        <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>

                  <CardFooter className="flex justify-end">
                    <Button
                      type="submit"
                      onClick={handlePasswordUpdate}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/40 dark:border-destructive/60">
                  <CardHeader className="text-red-500 dark:text-red-400">
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription className="text-primary/80 dark:text-primary/60">
                      Permanently delete your account and all associated data
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Alert className='text-red-500 dark:text-red-400'>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className='text-red-500 dark:text-red-400'>Warning</AlertTitle>
                      <AlertDescription className='text-primary/80 dark:text-primary/60'>
                        This action cannot be undone. All your data will be permanently removed
                        from our servers.
                      </AlertDescription>
                    </Alert>
                  </CardContent>

                  <CardFooter className="flex justify-end">
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={() => generateVerificationCode()}
                          disabled={isLoading}
                        >
                          Delete Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Delete Account</DialogTitle>
                          <DialogDescription className="text-primary/80 dark:text-primary/60">
                            This action cannot be undone. To confirm, please enter the verification code below.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                          <div className="mb-4 p-3 bg-muted rounded-md font-mono text-center tracking-wider dark:bg-muted/50">
                            {verificationCode}
                          </div>

                          <Input
                            placeholder="Enter verification code"
                            value={userVerificationInput}
                            onChange={(e) => setUserVerificationInput(e.target.value)}
                            className="mt-2"
                            disabled={isLoading}
                          />

                          <p className="text-sm text-muted-foreground mt-2 dark:text-muted-foreground/70">
                            Please type the verification code exactly as shown above to confirm deletion.
                          </p>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            disabled={userVerificationInput !== verificationCode || isLoading}
                            onClick={handleDeleteAccount}
                          >
                            {isLoading ? 'Deleting...' : 'Permanently Delete Account'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </FormProvider>
    </AppLayout>
  );
};

export default Page;