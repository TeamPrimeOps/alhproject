'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { ChartLine, Users, Clock, Lightning } from "@phosphor-icons/react";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your dispute resolution metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Resolution Rate', value: '85%', icon: ChartLine, color: 'blue' },
            { label: 'Active Cases', value: '24', icon: Users, color: 'green' },
            { label: 'Avg. Time', value: '3.2 days', icon: Clock, color: 'yellow' },
            { label: 'AI Insights', value: '142', icon: Lightning, color: 'purple' },
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Resolution Timeline</h2>
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Chart coming soon</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Case Distribution</h2>
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Chart coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}