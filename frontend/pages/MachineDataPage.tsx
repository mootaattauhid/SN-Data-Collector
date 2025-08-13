import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import MachineDataTable from '../components/MachineDataTable';

export default function MachineDataPage() {
  const [searchSN, setSearchSN] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const backend = useBackend();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['machine-data', searchSN, currentPage],
    queryFn: async () => {
      const response = await backend.sn.getMachineData({
        sn: searchSN || undefined,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });
      return response;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Machine Data</h1>
          <p className="text-gray-600">
            {user?.role === 'user' && user?.employeeId 
              ? `View your machine data (Employee ID: ${user.employeeId})`
              : 'View collected machine data from all SNs'
            }
          </p>
        </div>
      </div>

      {user?.role === 'super_admin' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search by SN..."
                value={searchSN}
                onChange={(e) => setSearchSN(e.target.value)}
              />
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchSN('');
                setCurrentPage(1);
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </form>
        </div>
      )}

      <MachineDataTable
        data={data?.data || []}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        total={data?.total || 0}
      />
    </div>
  );
}
