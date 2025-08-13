import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Download, Trash2, Edit, Play, Zap } from 'lucide-react';
import { useBackend } from '../hooks/useBackend';
import type { SNEntry } from '~backend/sn/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SNForm from '../components/SNForm';
import SNTable from '../components/SNTable';
import ConfirmDialog from '../components/ConfirmDialog';

export default function SNListPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingSN, setEditingSN] = useState<SNEntry | null>(null);
  const [deletingSN, setDeletingSN] = useState<SNEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const backend = useBackend();

  const { data: snData, isLoading } = useQuery({
    queryKey: ['sn-list'],
    queryFn: async () => {
      const response = await backend.sn.listSN();
      return response.entries;
    },
  });

  const collectAllMutation = useMutation({
    mutationFn: () => backend.sn.collectAllData(),
    onSuccess: (data) => {
      toast({
        title: "Data Collection Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['sn-list'] });
    },
    onError: (error: any) => {
      console.error('Collect all data error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to collect data from all SNs",
        variant: "destructive",
      });
    },
  });

  const compactAllMutation = useMutation({
    mutationFn: () => backend.sn.compactAllData(),
    onSuccess: (data) => {
      toast({
        title: "Compact Complete",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['sn-list'] });
    },
    onError: (error: any) => {
      console.error('Compact all data error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to compact data for all SNs",
        variant: "destructive",
      });
    },
  });

  const collectDataMutation = useMutation({
    mutationFn: (id: number) => backend.sn.collectData({ id }),
    onSuccess: (data) => {
      toast({
        title: data.success ? "Success" : "Error",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['sn-list'] });
    },
    onError: (error: any) => {
      console.error('Collect data error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to collect data",
        variant: "destructive",
      });
    },
  });

  const compactDataMutation = useMutation({
    mutationFn: (id: number) => backend.sn.compactData({ id }),
    onSuccess: (data) => {
      toast({
        title: data.success ? "Success" : "Error",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ['sn-list'] });
    },
    onError: (error: any) => {
      console.error('Compact data error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to compact data",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.sn.deleteSN({ id }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "SN entry deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['sn-list'] });
      setDeletingSN(null);
    },
    onError: (error: any) => {
      console.error('Delete SN error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete SN entry",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (sn: SNEntry) => {
    setEditingSN(sn);
    setShowForm(true);
  };

  const handleDelete = (sn: SNEntry) => {
    setDeletingSN(sn);
  };

  const handleCollectData = (id: number) => {
    collectDataMutation.mutate(id);
  };

  const handleCompactData = (id: number) => {
    compactDataMutation.mutate(id);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSN(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    queryClient.invalidateQueries({ queryKey: ['sn-list'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SN Management</h1>
          <p className="text-gray-600">Manage serial numbers and collect machine data</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => collectAllMutation.mutate()}
            disabled={collectAllMutation.isPending}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {collectAllMutation.isPending ? 'Collecting...' : 'Collect All Data'}
          </Button>
          <Button
            onClick={() => compactAllMutation.mutate()}
            disabled={compactAllMutation.isPending}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            {compactAllMutation.isPending ? 'Compacting...' : 'Compact All'}
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add SN
          </Button>
        </div>
      </div>

      <SNTable
        data={snData || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCollectData={handleCollectData}
        onCompactData={handleCompactData}
        collectingIds={collectDataMutation.variables ? [collectDataMutation.variables] : []}
        compactingIds={compactDataMutation.variables ? [compactDataMutation.variables] : []}
      />

      {showForm && (
        <SNForm
          sn={editingSN}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {deletingSN && (
        <ConfirmDialog
          title="Delete SN Entry"
          description={`Are you sure you want to delete SN "${deletingSN.sn}"? This will also delete all associated machine data.`}
          onConfirm={() => deleteMutation.mutate(deletingSN.id)}
          onCancel={() => setDeletingSN(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
