import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '~backend/employee/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  employeeId: string;
  name: string;
  nik: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  address: string;
  hireDate: string;
  active: boolean;
}

export default function EmployeeForm({ employee, onClose, onSuccess }: EmployeeFormProps) {
  const { toast } = useToast();
  const backend = useBackend();
  const isEditing = !!employee;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      employeeId: employee?.employeeId || '',
      name: employee?.name || '',
      nik: employee?.nik || '',
      department: employee?.department || '',
      position: employee?.position || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      address: employee?.address || '',
      hireDate: employee?.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
      active: employee?.active ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeeRequest) => backend.employee.createEmployee(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Create employee error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create employee",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEmployeeRequest) => backend.employee.updateEmployee(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Update employee error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = {
      employeeId: data.employeeId,
      name: data.name,
      nik: data.nik,
      department: data.department || undefined,
      position: data.position || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      ...(isEditing && { active: data.active }),
    };

    if (isEditing && employee) {
      updateMutation.mutate({ id: employee.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                {...register('employeeId', { required: 'Employee ID is required' })}
                placeholder="Enter employee ID"
              />
              {errors.employeeId && (
                <p className="text-sm text-red-600 mt-1">{errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="nik">NIK *</Label>
              <Input
                id="nik"
                {...register('nik', { required: 'NIK is required' })}
                placeholder="Enter NIK"
              />
              {errors.nik && (
                <p className="text-sm text-red-600 mt-1">{errors.nik.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Enter department"
              />
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                {...register('position')}
                placeholder="Enter position"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="Enter email"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Enter address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="hireDate">Hire Date</Label>
            <Input
              id="hireDate"
              type="date"
              {...register('hireDate')}
            />
          </div>

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
