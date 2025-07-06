import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils/uuidUtil';

export interface Note {
  id: string;
  title: string;
  content: string;
  created: Date;
  modified: Date;
}

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  
  // Actions
  addNote: () => void;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'created'>>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  
  // Selectors
  getSelectedNote: () => Note | null;
  getNotes: (searchTerm?: string) => Note[];
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      // Initial state
      notes: [
        {
          id: '1',
          title: 'Welcome to Notes',
          content: 'This is your first note. Start typing to create more!',
          created: new Date(),
          modified: new Date()
        }
      ],
      selectedNoteId: '1',
      
      // Actions
      addNote: () => {
        const newNote: Note = {
          id: generateId(),
          title: 'New Note',
          content: '',
          created: new Date(),
          modified: new Date()
        };
        
        set(state => ({ 
          notes: [newNote, ...state.notes],
          selectedNoteId: newNote.id
        }));
      },
      
      updateNote: (id, updates) => {
        set(state => ({
          notes: state.notes.map(note => 
            note.id === id 
              ? { ...note, ...updates, modified: new Date() } 
              : note
          )
        }));
      },
      
      deleteNote: (id) => {
        const { notes, selectedNoteId } = get();
        const updatedNotes = notes.filter(note => note.id !== id);
        
        // If we're deleting the selected note, select another one
        let newSelectedId = selectedNoteId;
        if (selectedNoteId === id) {
          newSelectedId = updatedNotes.length > 0 ? updatedNotes[0].id : null;
        }
        
        set({ 
          notes: updatedNotes,
          selectedNoteId: newSelectedId
        });
      },
      
      selectNote: (id) => {
        set({ selectedNoteId: id });
      },
      
      // Selectors
      getSelectedNote: () => {
        const { notes, selectedNoteId } = get();
        return notes.find(note => note.id === selectedNoteId) || null;
      },
      
      getNotes: (searchTerm = '') => {
        const { notes } = get();
        if (!searchTerm) return notes;
        
        const term = searchTerm.toLowerCase();
        return notes.filter(note => 
          note.title.toLowerCase().includes(term) || 
          note.content.toLowerCase().includes(term)
        );
      }
    }),
    {
      name: 'melani-notes-storage',
      version: 1,
    }
  )
);
