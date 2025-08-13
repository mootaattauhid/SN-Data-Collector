import React from 'react';
import { Edit, Trash2, Download, Zap } from 'lucide-react';
import type { SNEntry } from '~backend/sn/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SNTableProps {
  data: SNEntry[];
  isLoading: boolean;
  onEdit: (sn: SNEntry) => void;
  onDelete: (sn: SNEntry) => void;
  onCollectData: (id: number) => void;
  onCompactData: (id: number) => void;
  collectingIds: number[];
  compactingIds: number[];
}

export default function SNTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onCollectData,
  onCompactData,
  collectingIds,
  compactingIds,
}: SNTableProps) {
  const getStatusBadge = (status: string) => {
    if (status.includes('Connected')) {
      return <Badge variant="default" className="bg-green-100 text-green-800">{status}</Badge>;
    }
    if (status.includes('Error') || status.includes('Failed')) {
      return <Badge variant="destructive">{status}</Badge>;
    }
    if (status.includes('Processing') || status.includes('Compacting')) {
      return <Badge variant="secondary">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading SN entries...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8 text-center">
          <p className="text-gray-600">No SN entries found. Add your first entry to get started.</p>
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
                Serial Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.sn}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(entry.startDate).toLocaleDateString()} - {new Date(entry.endDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(entry.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    Machine: {entry.dataCount} | Sheet: {entry.sheetCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCollectData(entry.id)}
                    disabled={collectingIds.includes(entry.id)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {collectingIds.includes(entry.id) ? 'Collecting...' : 'Collect'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCompactData(entry.id)}
                    disabled={compactingIds.includes(entry.id)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {compactingIds.includes(entry.id) ? 'Compacting...' : 'Compact'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(entry)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(entry)}
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
