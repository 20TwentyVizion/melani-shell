
import React, { useState } from 'react';
import { Plus, Save, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/contexts/NotificationContext';
import { useNotesStore, Note } from '@/lib/stores/notesStore';

// Using Note interface from notesStore

const NotesApp = () => {
  // Use the persisted Zustand store instead of local state
  const { 
    notes, 
    addNote: createNote, 
    updateNote, 
    deleteNote, 
    selectNote, 
    getSelectedNote,
    getNotes
  } = useNotesStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const { showSuccess } = useNotification();
  
  // Get the current selected note
  const selectedNote = getSelectedNote();
  
  // Filter notes based on search term
  const filteredNotes = getNotes(searchTerm);

  // Create note function now just calls the store action
  const handleCreateNote = () => {
    createNote();
    showSuccess('Note created', 'New note created successfully');
  };

  const saveNote = () => {
    if (!selectedNote) return;
    showSuccess('Note saved', 'Your note has been saved successfully');
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    showSuccess('Note deleted', 'Note has been deleted');
  };

  const updateSelectedNote = (field: 'title' | 'content', value: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { [field]: value });
  };

  return (
    <div className="w-full h-full flex">
      <div className="w-1/3 border-r border-white/10 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-effect border-white/20"
            />
          </div>
          <Button onClick={handleCreateNote} size="sm" className="glass-effect">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedNote?.id === note.id ? 'bg-blue-500/20' : 'glass-effect hover:bg-white/5'
              }`}
              onClick={() => selectNote(note.id)}
            >
              <div className="font-medium truncate">{note.title}</div>
              <div className="text-sm opacity-70 truncate">{note.content}</div>
              <div className="text-xs opacity-50 mt-1">
                {note.modified.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4">
        {selectedNote ? (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Input
                value={selectedNote.title}
                onChange={(e) => updateSelectedNote('title', e.target.value)}
                className="font-medium glass-effect border-white/20"
                placeholder="Note title..."
              />
              <Button onClick={saveNote} className="glass-effect">
                <Save className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleDeleteNote(selectedNote.id)}
                variant="destructive"
                className="glass-effect"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              value={selectedNote.content}
              onChange={(e) => updateSelectedNote('content', e.target.value)}
              className="flex-1 glass-effect border-white/20 resize-none"
              placeholder="Start writing your note..."
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a note to start editing
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesApp;
