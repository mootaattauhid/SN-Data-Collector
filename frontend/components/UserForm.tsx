import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import type { User, CreateUserRequest, UpdateUserRequest } from '~backend/auth/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

interface UserFormProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  username: string;
  password: string;
  role: 'super_admin' | 'user';
  employeeId: string;
  active: boolean;
}

export default function UserForm({ user, onClose, onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const backend = useBackend();
  const isEditing = !!user;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      username: user?.username || '',
      password: '',
      role: user?.role || 'user',
      employeeId: user?.employeeId || '',
      active: user?.active ?? true,
    },
  });

  const watchedRole = watch('role');

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => backend.auth.createUser(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Create user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => backend.auth.updateUser(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Update user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      username: data.username,
      role: data.role,
      employeeId: data.role === 'user' ? data.employeeId : undefined,
      ...(data.password && { password: data.password }),
      ...(isEditing && { active: data.active }),
    };

    if (isEditing && user) {
      updateMutation.mutate({ id: user.id, ...payload });
    } else {
      if (!data.password) {
        toast({
          title: "Error",
          description: "Password is required for new users",
          variant: "destructive",
        });
        return;
      }
      createMutation.mutate({ ...payload, password: data.password });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register('username', { required: 'Username is required' })}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">
              Password {isEditing && <span className="text-gray-500">(leave blank to keep current)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password', { 
                required: !isEditing ? 'Password is required' : false 
              })}
              placeholder={isEditing ? "Enter new password" : "Enter password"}
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={watchedRole}
              onValueChange={(value: 'super_admin' | 'user') => setValue('role', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {watchedRole === 'user' && (
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                {...register('employeeId', { 
                  required: watchedRole === 'user' ? 'Employee ID is required for users' : false 
                })}
                placeholder="Enter employee ID"
              />
              {errors.employeeId && (
                <p className="text-sm text-red-600 mt-1">{errors.employeeId.message}</p>
              )}
            </div>
          )}

          {isEditing && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={watch('active')}
                onCheckedChange={(checked) => setValue('active', !!checked)}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
