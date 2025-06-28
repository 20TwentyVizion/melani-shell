
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VoiceSettings {
  voiceInputEnabled: boolean;
  voiceOutputEnabled: boolean;
  selectedVoice: string;
  wakeWordEnabled: boolean;
  setVoiceInputEnabled: (enabled: boolean) => void;
  setVoiceOutputEnabled: (enabled: boolean) => void;
  setSelectedVoice: (voice: string) => void;
  setWakeWordEnabled: (enabled: boolean) => void;
}

export const useVoiceSettings = create<VoiceSettings>()(
  persist(
    (set) => ({
      voiceInputEnabled: false,
      voiceOutputEnabled: false,
      selectedVoice: '',
      wakeWordEnabled: false,
      setVoiceInputEnabled: (enabled) => set({ voiceInputEnabled: enabled }),
      setVoiceOutputEnabled: (enabled) => set({ voiceOutputEnabled: enabled }),
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      setWakeWordEnabled: (enabled) => set({ wakeWordEnabled: enabled }),
    }),
    {
      name: 'melani-voice-settings',
    }
  )
);
