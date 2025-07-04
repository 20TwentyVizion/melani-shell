
import { VoiceService } from './voiceService';

interface VoiceCommand {
  trigger: string[];
  action: (params?: string[]) => void;
  description: string;
  category: 'navigation' | 'apps' | 'system' | 'search';
}

export class VoiceCommandService {
  private voiceService: VoiceService;
  private commands: VoiceCommand[] = [];
  private isListening = false;
  private onCommandCallback: (command: string) => void = () => {};

  constructor() {
    this.voiceService = new VoiceService();
    this.setupCommands();
    this.initializeVoiceRecognition();
  }

  private setupCommands() {
    // Navigation commands
    this.addCommand({
      trigger: ['open settings', 'show settings', 'settings'],
      action: () => this.onCommandCallback('open settings'),
      description: 'Open system settings',
      category: 'navigation'
    });

    this.addCommand({
      trigger: ['open files', 'file manager', 'files'],
      action: () => this.onCommandCallback('open files'),
      description: 'Open file explorer',
      category: 'apps'
    });

    this.addCommand({
      trigger: ['open calculator', 'calculator'],
      action: () => this.onCommandCallback('open calculator'),
      description: 'Open calculator',
      category: 'apps'
    });

    this.addCommand({
      trigger: ['open notes', 'notes'],
      action: () => this.onCommandCallback('open notes'),
      description: 'Open notes app',
      category: 'apps'
    });

    this.addCommand({
      trigger: ['search for', 'find', 'search'],
      action: (params) => this.onCommandCallback(`search ${params?.join(' ') || ''}`),
      description: 'Search for files and apps',
      category: 'search'
    });

    this.addCommand({
      trigger: ['what time is it', 'current time', 'time'],
      action: () => this.onCommandCallback(`time ${new Date().toLocaleTimeString()}`),
      description: 'Get current time',
      category: 'system'
    });

    this.addCommand({
      trigger: ['hey melani', 'open melani', 'assistant'],
      action: () => this.onCommandCallback('open melani'),
      description: 'Open AI assistant',
      category: 'apps'
    });
  }

  private addCommand(command: VoiceCommand) {
    this.commands.push(command);
  }

  private initializeVoiceRecognition() {
    this.voiceService.onTranscript((transcript) => {
      this.processVoiceCommand(transcript.toLowerCase().trim());
    });
  }

  private processVoiceCommand(transcript: string) {
    console.log('Processing voice command:', transcript);
    
    for (const command of this.commands) {
      for (const trigger of command.trigger) {
        if (transcript.includes(trigger)) {
          // Extract parameters after the trigger
          const paramStart = transcript.indexOf(trigger) + trigger.length;
          const params = transcript.slice(paramStart).trim().split(' ').filter(p => p.length > 0);
          
          command.action(params.length > 0 ? params : undefined);
          return;
        }
      }
    }
    
    // If no command matched, treat as general search/AI query
    if (transcript.length > 0) {
      this.onCommandCallback(`query ${transcript}`);
    }
  }

  public startListening() {
    if (!this.isListening) {
      this.voiceService.startListening();
      this.isListening = true;
    }
  }

  public stopListening() {
    if (this.isListening) {
      this.voiceService.stopListening();
      this.isListening = false;
    }
  }

  public onCommand(callback: (command: string) => void) {
    this.onCommandCallback = callback;
  }

  public getAvailableCommands(): VoiceCommand[] {
    return this.commands;
  }

  public isSupported(): boolean {
    return this.voiceService.isSupported();
  }
}
