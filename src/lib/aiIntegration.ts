
import { VoiceCommandService } from './voiceCommands';
import { useSmartSuggestions } from './smartSuggestions';
import { usePredictiveText } from './predictiveText';
import { useLLMSettings } from './llmSettings';
import { LLMClient, ChatMessage } from './llmClient';

export interface AISystemContext {
  currentTime: Date;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  recentApps: string[];
  systemLoad: number;
  activeWindows: string[];
}

export class AIIntegrationService {
  private voiceCommandService: VoiceCommandService;
  private isInitialized = false;
  private contextUpdateCallback: (context: AISystemContext) => void = () => {};
  private llmClient: LLMClient | null = null;

  constructor() {
    this.voiceCommandService = new VoiceCommandService();
    this.initializeLLM();
  }

  private async initializeLLM() {
    const { provider, geminiApiKey, ollamaUrl, ollamaModel } = useLLMSettings.getState();
    
    this.llmClient = new LLMClient({
      provider,
      apiKey: geminiApiKey,
      ollamaUrl,
      model: ollamaModel,
    });

    await this.llmClient.initialize();
  }

  public async reinitializeLLM() {
    await this.initializeLLM();
  }

  public initialize(onCommand: (command: string) => void) {
    if (this.isInitialized) return;
    
    this.voiceCommandService.onCommand(onCommand);
    this.isInitialized = true;
    
    // Start context monitoring
    this.startContextMonitoring();
  }

  public startVoiceListening() {
    this.voiceCommandService.startListening();
  }

  public stopVoiceListening() {
    this.voiceCommandService.stopListening();
  }

  public isVoiceSupported(): boolean {
    return this.voiceCommandService.isSupported();
  }

  public getAvailableCommands() {
    return this.voiceCommandService.getAvailableCommands();
  }

  private startContextMonitoring() {
    // Update context every minute
    setInterval(() => {
      const context = this.getCurrentContext();
      this.contextUpdateCallback(context);
    }, 60000);
  }

  private getCurrentContext(): AISystemContext {
    const now = new Date();
    const hour = now.getHours();
    
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 20) timeOfDay = 'evening';
    else timeOfDay = 'night';

    return {
      currentTime: now,
      timeOfDay,
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      recentApps: this.getRecentApps(),
      systemLoad: this.getSystemLoad(),
      activeWindows: this.getActiveWindows()
    };
  }

  private getRecentApps(): string[] {
    // Get recent apps from smart suggestions
    const { getMostUsedApps } = useSmartSuggestions.getState();
    return getMostUsedApps().slice(0, 5);
  }

  private getSystemLoad(): number {
    // Simulate system load (in real OS, this would be actual system metrics)
    return Math.random() * 100;
  }

  private getActiveWindows(): string[] {
    // In a real implementation, this would track actual window states
    return ['melani', 'settings', 'files'];
  }

  public onContextUpdate(callback: (context: AISystemContext) => void) {
    this.contextUpdateCallback = callback;
  }

  public getSmartSuggestions(limit = 4): string[] {
    const { getSmartSuggestions } = useSmartSuggestions.getState();
    return getSmartSuggestions(limit);
  }

  public getPredictiveText(input: string, limit = 3): string[] {
    const { getSuggestions } = usePredictiveText.getState();
    return getSuggestions(input, limit);
  }

  public addUsageTracking(appType: string) {
    const { addUsage } = useSmartSuggestions.getState();
    addUsage(appType);
  }

  public addPhraseToLearning(phrase: string) {
    const { addPhrase } = usePredictiveText.getState();
    addPhrase(phrase);
  }

  public async processAIQuery(message: string): Promise<string> {
    if (!this.llmClient) {
      await this.initializeLLM();
    }

    if (!this.llmClient) {
      return "AI assistant is not available. Please check your LLM settings.";
    }

    const context = this.getCurrentContext();
    const systemPrompt = `You are the OS AI assistant. Keep responses brief and helpful. Current context: ${context.timeOfDay} on ${context.dayOfWeek}, active apps: ${context.activeWindows.join(', ')}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const response = await this.llmClient.chat(messages, { temperature: 0.7, maxTokens: 150 });
    return response.content || response.error || "I couldn't process that request.";
  }
}
