import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import type { SNEntry, CreateSNRequest, UpdateSNRequest } from '~backend/sn/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface SNFormProps {
  sn?: SNEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  sn: string;
  password: string;
  startDate: string;
  endDate: string;
}

export default function SNForm({ sn, onClose, onSuccess }: SNFormProps) {
  const { toast } = useToast();
  const backend = useBackend();
  const isEditing = !!sn;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      sn: sn?.sn || '',
      password: sn?.password || '',
      startDate: sn?.startDate ? new Date(sn.startDate).toISOString().slice(0, 16) : '',
      endDate: sn?.endDate ? new Date(sn.endDate).toISOString().slice(0, 16) : '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSNRequest) => backend.sn.createSN(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SN entry created successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Create SN error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create SN entry",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSNRequest) => backend.sn.updateSN(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SN entry updated successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Update SN error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update SN entry",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      sn: data.sn,
      password: data.password,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    };

    if (isEditing && sn) {
      updateMutation.mutate({ id: sn.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit SN Entry' : 'Add New SN Entry'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="sn">Serial Number</Label>
            <Input
              id="sn"
              {...register('sn', { required: 'Serial number is required' })}
              placeholder="Enter serial number"
            />
            {errors.sn && (
              <p className="text-sm text-red-600 mt-1">{errors.sn.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="datetime-local"
              {...register('startDate', { required: 'Start date is required' })}
            />
            {errors.startDate && (
              <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              {...register('endDate', { required: 'End date is required' })}
            />
            {errors.endDate && (
              <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
            )}
          </div>

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
