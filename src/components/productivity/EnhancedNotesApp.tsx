
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit3, Trash2, Save, Tag } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EnhancedNotesApp = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('melani-notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('melani-notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditTags('');
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!selectedNote) return;

    const updatedNote = {
      ...selectedNote,
      title: editTitle || 'Untitled',
      content: editContent,
      tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedAt: new Date()
    };

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id ? updatedNote : note
    ));
    setSelectedNote(updatedNote);
    setIsEditing(false);
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
    setIsEditing(true);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-full min-h-96">
      {/* Notes List */}
      <div className="w-1/3 border-r border-white/10 p-4 space-y-4">
        <div className="flex gap-2">
          <Button onClick={createNewNote} size="sm" className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-effect"
          />
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredNotes.map(note => (
            <Card
              key={note.id}
              className={`cursor-pointer transition-colors ${
                selectedNote?.id === note.id ? 'bg-blue-900/30' : 'glass-effect hover:bg-white/5'
              }`}
              onClick={() => setSelectedNote(note)}
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm truncate">{note.title}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                  {note.content || 'No content'}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {note.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{note.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {note.updatedAt.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 p-4">
        {selectedNote ? (
          <div className="space-y-4 h-full">
            {isEditing ? (
              <>
                <div className="flex gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Note title..."
                    className="glass-effect"
                  />
                  <Button onClick={saveNote} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                    Cancel
                  </Button>
                </div>

                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="Tags (comma separated)..."
                    className="pl-10 glass-effect"
                  />
                </div>

                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Start writing your note..."
                  className="flex-1 min-h-64 glass-effect resize-none"
                />
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{selectedNote.title}</h1>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {selectedNote.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button onClick={() => startEditing(selectedNote)} size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>

                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedNote.content || 'This note is empty. Click Edit to add content.'}
                  </pre>
                </div>

                <div className="text-xs text-gray-500 mt-auto pt-4 border-t border-white/10">
                  Created: {selectedNote.createdAt.toLocaleString()}
                  <br />
                  Updated: {selectedNote.updatedAt.toLocaleString()}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Edit3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a note to view or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedNotesApp;
