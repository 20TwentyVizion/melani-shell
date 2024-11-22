import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useSystemMemory } from "@/lib/systemMemory";

const SystemStats = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');
  const { toast } = useToast();
  const { totalMemory, usedMemory, processes } = useSystemMemory();

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini-api-key', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved successfully."
    });
  };

  return (
    <Card className="w-[400px] glass-effect">
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Gemini API Key</label>
          <div className="flex space-x-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
            />
            <Button onClick={handleSaveApiKey}>Save</Button>
          </div>
        </div>

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
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStats;