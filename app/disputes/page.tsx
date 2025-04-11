'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import DisputeForm from '@/components/DisputeForm';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import WalkthroughDialog from '@/components/WalkthroughDialog';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDisputes(data || []);
      setShowWalkthrough(data?.length === 0);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeClick = (id: string) => {
    router.push(`/disputes/${id}`);
  };

  const getAiSummary = (analysis: string) => {
    // Extract the first paragraph from the AI analysis
    const firstParagraph = analysis?.split('\n')[0] || 'No summary available';
    return firstParagraph;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Disputes</h1>
            <p className="text-muted-foreground mt-1">Manage and track your disputes</p>
          </div>
          <Button onClick={() => setShowWalkthrough(true)}>New Dispute</Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <h3 className="text-lg font-semibold">No disputes yet</h3>
            <p className="text-muted-foreground mt-2">Create your first dispute to get started</p>
            <Button className="mt-4" onClick={() => setShowWalkthrough(true)}>
              Create Dispute
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute: any) => (
              <div
                key={dispute.id}
                className="bg-card p-6 rounded-xl shadow-sm border cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => handleDisputeClick(dispute.id)}
              >
                <h3 className="font-semibold">{dispute.title}</h3>
                <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                  {getAiSummary(dispute.ai_analysis)}
                </p>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(dispute.created_at).toLocaleDateString()}
                  </p>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    dispute.status === 'completed' ? 'bg-green-100 text-green-800' :
                    dispute.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {dispute.status === 'in_progress' ? 'In Progress' :
                     dispute.status === 'completed' ? 'Completed' :
                     dispute.status === 'cancelled' ? 'Cancelled' : 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <WalkthroughDialog 
          open={showWalkthrough} 
          onClose={() => setShowWalkthrough(false)} 
        />
      </div>
    </DashboardLayout>
  );
}