'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Blockchain } from '@/lib/blockchain';

export default function BuildPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const blockchain = new Blockchain();

  const handleViewChain = () => {
    setBlocks(blockchain.chain);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Blockchain Build</h1>
          <p className="text-gray-600 mt-1">View and verify the blockchain</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Blockchain Status</h2>
            <Button onClick={handleViewChain}>
              View Chain
            </Button>
          </div>

          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Block Index</p>
                    <p className="font-mono">{block.index}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Timestamp</p>
                    <p className="font-mono">{new Date(block.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Previous Hash</p>
                    <p className="font-mono text-xs truncate">{block.previousHash}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hash</p>
                    <p className="font-mono text-xs truncate">{block.hash}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Data</p>
                    <pre className="bg-gray-50 p-2 rounded mt-1 text-xs overflow-auto">
                      {JSON.stringify(block.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}