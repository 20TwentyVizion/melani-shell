
import { VoiceCommandService } from './voiceCommands';
import { useSmartSuggestions } from './smartSuggestions';
import { usePredictiveText } from './predictiveText';

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

  constructor() {
    this.voiceCommandService = new VoiceCommandService();
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
}
