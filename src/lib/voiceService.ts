
// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private stateChangeCallback: (state: VoiceState) => void = () => {};
  private transcriptCallback: (text: string) => void = () => {};
  private currentState: VoiceState = 'idle';

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.setState('listening');
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.setState('processing');
        this.transcriptCallback(transcript);
      };

      this.recognition.onend = () => {
        if (this.currentState === 'listening') {
          this.setState('idle');
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.setState('idle');
      };
    }
  }

  private setState(state: VoiceState) {
    this.currentState = state;
    this.stateChangeCallback(state);
  }

  public startListening() {
    if (this.recognition && this.currentState === 'idle') {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.currentState === 'listening') {
      this.recognition.stop();
    }
  }

  public speak(text: string, voice?: string) {
    if (!text.trim()) return;

    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      this.setState('speaking');
    };

    utterance.onend = () => {
      this.setState('idle');
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.setState('idle');
    };

    this.setState('speaking');
    this.synthesis.speak(utterance);
  }

  public stopSpeaking() {
    this.synthesis.cancel();
    this.setState('idle');
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && !!window.speechSynthesis;
  }

  public onStateChange(callback: (state: VoiceState) => void) {
    this.stateChangeCallback = callback;
  }

  public onTranscript(callback: (text: string) => void) {
    this.transcriptCallback = callback;
  }

  public getCurrentState(): VoiceState {
    return this.currentState;
  }
}
