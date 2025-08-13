import React from 'react';
import { Edit, Trash2, Shield, User } from 'lucide-react';
import type { User } from '~backend/auth/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserTableProps {
  data: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: UserTableProps) {
  const getRoleBadge = (role: string) => {
    if (role === 'super_admin') {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          <Shield className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <User className="h-3 w-3 mr-1" />
        User
      </Badge>
    );
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <p className="text-gray-600">No users found. Add your first user to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.employeeId || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.active)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
