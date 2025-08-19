import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, Download, Search } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import type { Employee } from '~backend/employee/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeImport from '../components/EmployeeImport';
import ConfirmDialog from '../components/ConfirmDialog';

export default function EmployeeManagementPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await backend.employee.listEmployees();
      return response.employees;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backend.employee.deleteEmployee({ id }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeletingEmployee(null);
    },
    onError: (error: any) => {
      console.error('Delete employee error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = (employee: Employee) => {
    setDeletingEmployee(employee);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const handleImportClose = () => {
    setShowImport(false);
  };

  const handleImportSuccess = () => {
    handleImportClose();
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const handleExport = () => {
    if (!employeeData || employeeData.length === 0) {
      toast({
        title: "No Data",
        description: "No employees to export",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'Employee ID',
      'Name',
      'NIK',
      'Department',
      'Position',
      'Email',
      'Phone',
      'Address',
      'Hire Date',
      'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...employeeData.map(emp => [
        emp.employeeId,
        `"${emp.name}"`,
        emp.nik,
        `"${emp.department || ''}"`,
        `"${emp.position || ''}"`,
        emp.email || '',
        emp.phone || '',
        `"${emp.address || ''}"`,
        emp.hireDate ? new Date(emp.hireDate).toISOString().split('T')[0] : '',
        emp.active ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = employeeData?.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage employee data and information</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search employees by name, ID, NIK, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <EmployeeTable
        data={filteredEmployees}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {showImport && (
        <EmployeeImport
          onClose={handleImportClose}
          onSuccess={handleImportSuccess}
        />
      )}

      {deletingEmployee && (
        <ConfirmDialog
          title="Delete Employee"
          description={`Are you sure you want to delete employee "${deletingEmployee.name}" (${deletingEmployee.employeeId})? This action cannot be undone.`}
          onConfirm={() => deleteMutation.mutate(deletingEmployee.id)}
          onCancel={() => setDeletingEmployee(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
