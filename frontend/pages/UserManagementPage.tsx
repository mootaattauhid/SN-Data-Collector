import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import type { User } from '~backend/auth/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';
import ConfirmDialog from '../components/ConfirmDialog';

export default function UserManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await backend.auth.listUsers();
      return response.users;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backend.auth.deleteUser({ id }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <UserTable
        data={userData || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {deletingUser && (
        <ConfirmDialog
          title="Delete User"
          description={`Are you sure you want to delete user "${deletingUser.username}"? This action cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(deletingUser.id)}
          onCancel={() => setDeletingUser(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
