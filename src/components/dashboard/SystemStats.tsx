
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSystemMemory } from "@/lib/systemMemory";

const SystemStats = () => {
  const { totalMemory, usedMemory, processes } = useSystemMemory();

  return (
    <Card className="w-[400px] glass-effect">
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Memory Usage</h3>
            <div className="text-2xl font-bold">
              {((usedMemory / totalMemory) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">
              {usedMemory}MB / {totalMemory}MB
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Running Processes</h3>
            <div className="text-2xl font-bold">{processes.length}</div>
          </div>

          <div>
            <h3 className="text-sm font-medium">AI Model</h3>
            <div className="text-sm text-gray-400">TinyLlama-1.1B (Local)</div>
            <div className="text-xs text-gray-500">Runs entirely in your browser</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStats;
