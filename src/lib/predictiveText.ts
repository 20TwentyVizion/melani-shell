
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PredictiveTextState {
  commonPhrases: string[];
  userPhrases: string[];
  addPhrase: (phrase: string) => void;
  getSuggestions: (input: string, limit?: number) => string[];
  getSmartCompletions: (context: string, input: string) => string[];
}

const defaultPhrases = [
  // Common app-related phrases
  'Open file explorer',
  'Create new note',
  'Calculate the total',
  'Schedule a meeting',
  'Check the calendar',
  'Play some music',
  'Take a screenshot',
  'Search for files',
  
  // Common productivity phrases
  'Let me think about this',
  'I need to remember',
  'Important deadline',
  'Meeting notes',
  'Action items',
  'Follow up on',
  'Review and update',
  'Send email to',
  
  // Common conversational phrases
  'What do you think',
  'Can you help me',
  'I would like to',
  'Please let me know',
  'Thank you for',
  'Looking forward to',
  'Best regards',
  'Kind regards'
];

export const usePredictiveText = create<PredictiveTextState>()(
  persist(
    (set, get) => ({
      commonPhrases: defaultPhrases,
      userPhrases: [],
      
      addPhrase: (phrase: string) => {
        if (phrase.length < 3) return;
        
        set(state => ({
          userPhrases: [...new Set([...state.userPhrases, phrase.trim()].slice(-50))]
        }));
      },

      getSuggestions: (input: string, limit = 5) => {
        if (input.length < 2) return [];
        
        const { commonPhrases, userPhrases } = get();
        const allPhrases = [...userPhrases, ...commonPhrases];
        const lowerInput = input.toLowerCase();
        
        const matches = allPhrases
          .filter(phrase => phrase.toLowerCase().includes(lowerInput))
          .sort((a, b) => {
            // Prioritize user phrases
            const aIsUser = userPhrases.includes(a);
            const bIsUser = userPhrases.includes(b);
            if (aIsUser && !bIsUser) return -1;
            if (!aIsUser && bIsUser) return 1;
            
            // Then prioritize exact starts
            const aStarts = a.toLowerCase().startsWith(lowerInput);
            const bStarts = b.toLowerCase().startsWith(lowerInput);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            // Finally sort by length (shorter first)
            return a.length - b.length;
          })
          .slice(0, limit);
        
        return matches;
      },

      getSmartCompletions: (context: string, input: string) => {
        const { getSuggestions } = get();
        const contextLower = context.toLowerCase();
        
        // Context-aware suggestions
        let suggestions = getSuggestions(input, 3);
        
        // Add context-specific suggestions
        if (contextLower.includes('note') || contextLower.includes('document')) {
          const noteSuggestions = [
            'Important reminder',
            'Meeting notes from',
            'Ideas for project',
            'Things to remember'
          ].filter(s => s.toLowerCase().includes(input.toLowerCase()));
          suggestions = [...suggestions, ...noteSuggestions].slice(0, 5);
        }
        
        if (contextLower.includes('search') || contextLower.includes('find')) {
          const searchSuggestions = [
            'recent documents',
            'application files',
            'system settings',
            'user preferences'
          ].filter(s => s.toLowerCase().includes(input.toLowerCase()));
          suggestions = [...suggestions, ...searchSuggestions].slice(0, 5);
        }
        
        return [...new Set(suggestions)];
      }
    }),
    {
      name: 'melani-predictive-text',
    }
  )
);
