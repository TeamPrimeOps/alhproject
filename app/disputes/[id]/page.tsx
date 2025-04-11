'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import AiChatBox from '@/components/AiChatBox';
import { Button } from '@/components/ui/button';
import { FileText, Trash } from '@phosphor-icons/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Dispute {
  id: string;
  title: string;
  description: string;
  ai_analysis: string;
  document_path: string | null;
  created_at: string;
  status: 'in_progress' | 'cancelled' | 'completed';
}

export default function DisputeDetailsPage({ params }: { params: { id: string } }) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDispute();
  }, [params.id]);

  const fetchDispute = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setDispute(data);
    } catch (error) {
      console.error('Error fetching dispute:', error);
      router.push('/disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('disputes')
        .update({ status: newStatus })
        .eq('id', params.id);

      if (error) throw error;
      setDispute(prev => prev ? { ...prev, status: newStatus as Dispute['status'] } : null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('disputes')
        .delete()
        .eq('id', params.id);

      if (error) throw error;
      router.push('/disputes');
    } catch (error) {
      console.error('Error deleting dispute:', error);
    }
  };

  const handleViewDocument = async () => {
    if (!dispute?.document_path) return;

    const { data, error } = await supabase.storage
      .from('dispute-documents')
      .createSignedUrl(dispute.document_path, 60);

    if (error) {
      console.error('Error getting document URL:', error);
      return;
    }

    window.open(data.signedUrl, '_blank');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dispute details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!dispute) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Dispute not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{dispute.title}</h1>
              <p className="text-muted-foreground">
                Created on {new Date(dispute.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={dispute.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Dispute</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this dispute? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="whitespace-pre-wrap">{dispute.description}</p>
          </div>

          {dispute.document_path && (
            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Supporting Document</h2>
              <Button onClick={handleViewDocument} variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                View Document
              </Button>
            </div>
          )}
        </div>

        <div className="w-96 flex flex-col bg-card rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">AI Insights</h2>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="prose prose-sm">
              <p className="whitespace-pre-wrap">{dispute.ai_analysis}</p>
            </div>
          </div>

          <div className="border-t">
            <AiChatBox disputeId={dispute.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}