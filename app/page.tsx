'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ChartLineUp, Users, Clock, Lightning } from "@phosphor-icons/react";
import { supabase } from '@/lib/supabase';

interface DisputeStats {
  total: number;
  completed: number;
  inProgress: number;
}

interface Dispute {
  id: string;
  title: string;
  status: 'in_progress' | 'cancelled' | 'completed';
  created_at: string;
}

export default function Home() {
  const [stats, setStats] = useState<DisputeStats>({ total: 0, completed: 0, inProgress: 0 });
  const [recentDisputes, setRecentDisputes] = useState<Dispute[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all disputes to calculate stats
      const { data: disputes, error } = await supabase
        .from('disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const stats = {
        total: disputes?.length || 0,
        completed: disputes?.filter(d => d.status === 'completed').length || 0,
        inProgress: disputes?.filter(d => d.status === 'in_progress').length || 0,
      };

      setStats(stats);
      setRecentDisputes(disputes?.slice(0, 4) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string | null | undefined): string => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your dispute management dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Total Disputes', value: stats.total.toString(), icon: ChartLineUp, color: 'blue' },
            { label: 'Resolved Disputes', value: stats.completed.toString(), icon: Users, color: 'green' },
            { label: 'In Progress', value: stats.inProgress.toString(), icon: Clock, color: 'yellow' },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card p-6 rounded-xl shadow-sm border">
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} weight="fill" />
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-card p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Recent Disputes</h2>
          <div className="space-y-4">
            {recentDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded-lg px-4 transition-colors"
                onClick={() => router.push(`/disputes/${dispute.id}`)}
              >
                <div>
                  <p className="font-medium">{dispute.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(dispute.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(dispute.status)}`}>
                  {formatStatus(dispute.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}