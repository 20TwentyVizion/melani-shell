import React, { useState } from 'react';
import { Folder, File, Plus, FolderPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from './ui/use-toast';

interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  parentId: string | null;
}

const FileExplorer = () => {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const getCurrentItems = () => {
    return items.filter(item => item.parentId === currentFolder);
  };

  const handleCreateNew = (type: 'folder' | 'file') => {
    if (!newItemName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the new item",
        variant: "destructive"
      });
      return;
    }

    const newItem: FileSystemItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName,
      type,
      parentId: currentFolder
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setIsCreatingNew(false);
    
    toast({
      title: "Success",
      description: `${type === 'folder' ? 'Folder' : 'File'} created successfully`,
    });
  };

  const handleNavigate = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  return (
    <div className="p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => handleNavigate(null)}
            disabled={!currentFolder}
          >
            Root
          </Button>
          <span>/</span>
          {currentFolder && (
            <span className="text-sm">
              {items.find(i => i.id === currentFolder)?.name}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingNew(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {isCreatingNew && (
        <div className="mb-4 flex items-center space-x-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Enter name..."
            className="max-w-xs"
          />
          <Button onClick={() => handleCreateNew('folder')} variant="outline">
            <FolderPlus className="w-4 h-4 mr-2" />
            Folder
          </Button>
          <Button onClick={() => handleCreateNew('file')} variant="outline">
            <File className="w-4 h-4 mr-2" />
            File
          </Button>
          <Button onClick={() => setIsCreatingNew(false)} variant="ghost">
            Cancel
          </Button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {getCurrentItems().map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center p-4 rounded-lg hover:bg-white/5 cursor-pointer"
            onClick={() => item.type === 'folder' && handleNavigate(item.id)}
          >
            {item.type === 'folder' ? (
              <Folder className="w-12 h-12 text-blue-400" />
            ) : (
              <File className="w-12 h-12 text-gray-400" />
            )}
            <span className="mt-2 text-sm text-center">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;