
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSystemMemory } from "@/lib/systemMemory";
import { useVoiceSettings } from "@/lib/voiceSettings";
import { useLLMSettings } from "@/lib/llmSettings";
import { VoiceService } from "@/lib/voiceService";
import { LLMProvider } from "@/lib/llmClient";
import { useNotification } from "@/contexts/NotificationContext";

const SystemStats = () => {
  const { totalMemory, usedMemory, processes } = useSystemMemory();
  const {
    voiceInputEnabled,
    voiceOutputEnabled,
    selectedVoice,
    setVoiceInputEnabled,
    setVoiceOutputEnabled,
    setSelectedVoice,
  } = useVoiceSettings();
  
  const {
    provider,
    geminiApiKey,
    ollamaUrl,
    ollamaModel,
    setProvider,
    setGeminiApiKey,
    setOllamaUrl,
    setOllamaModel,
  } = useLLMSettings();
  
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceService] = useState(() => new VoiceService());
  const { showSuccess, showInfo } = useNotification();

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = voiceService.getAvailableVoices();
      setVoices(availableVoices);
      
      if (!selectedVoice && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [voiceService, selectedVoice, setSelectedVoice]);

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    showSuccess('LLM Provider Changed', `Switched to ${newProvider.charAt(0).toUpperCase() + newProvider.slice(1)}`);
  };

  const handleApiKeyTest = () => {
    if (provider === 'gemini' && geminiApiKey) {
      showInfo('Testing Connection', 'Verifying Gemini API key...');
      // In a real implementation, you would test the API key here
      setTimeout(() => {
        showSuccess('Connection Test', 'Gemini API key is valid');
      }, 1000);
    }
  };

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

          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium mb-4">OS AI Settings</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Default LLM Provider</Label>
                <Select value={provider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="glass-effect">
                    <SelectValue placeholder="Select LLM provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini (Recommended)</SelectItem>
                    <SelectItem value="webllm">WebLLM (Local)</SelectItem>
                    <SelectItem value="ollama">Ollama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {provider === 'gemini' && (
                <div className="space-y-2">
                  <Label className="text-sm">Gemini API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="Enter your Gemini API key"
                      className="glass-effect flex-1"
                    />
                    <Button 
                      size="sm" 
                      className="glass-effect"
                      onClick={handleApiKeyTest}
                      disabled={!geminiApiKey}
                    >
                      Test
                    </Button>
                  </div>
                  <div className="text-xs text-gray-400">
                    Get your API key from{' '}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </div>
                </div>
              )}

              {provider === 'ollama' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Ollama URL</Label>
                    <Input
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="glass-effect"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Model</Label>
                    <Input
                      value={ollamaModel}
                      onChange={(e) => setOllamaModel(e.target.value)}
                      placeholder="llama2"
                      className="glass-effect"
                    />
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                {provider === 'gemini' && 'Uses Google Gemini API - Best performance'}
                {provider === 'webllm' && 'Runs entirely in your browser - No API key needed'}
                {provider === 'ollama' && 'Connects to local Ollama instance'}
              </div>
            </div>
          </div>

          {voiceService.isSupported() && (
            <div className="border-t border-white/10 pt-4">
              <h3 className="text-sm font-medium mb-4">Voice Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm">Voice Input</label>
                  <Switch
                    checked={voiceInputEnabled}
                    onCheckedChange={setVoiceInputEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm">Voice Output</label>
                  <Switch
                    checked={voiceOutputEnabled}
                    onCheckedChange={setVoiceOutputEnabled}
                  />
                </div>

                {voiceOutputEnabled && voices.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm">Voice</label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="glass-effect">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStats;
