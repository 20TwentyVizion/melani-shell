
import { useState, useRef } from 'react';
import { Folder, File, Upload, Download, Trash2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotification } from '@/contexts/NotificationContext';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  path: string;
}

const EnhancedFileExplorer = () => {
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'Documents', type: 'folder', modified: new Date(), path: '/Documents' },
    { id: '2', name: 'Images', type: 'folder', modified: new Date(), path: '/Images' },
    { id: '3', name: 'Projects', type: 'folder', modified: new Date(), path: '/Projects' },
    { id: '4', name: 'README.txt', type: 'file', size: 1024, modified: new Date(), path: '/README.txt' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useNotification();

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach(file => {
        const newFile: FileItem = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: 'file',
          size: file.size,
          modified: new Date(),
          path: '/' + file.name
        };
        setFiles(prev => [...prev, newFile]);
      });
      showSuccess('Files uploaded', `${uploadedFiles.length} file(s) uploaded successfully`);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const newFolder: FileItem = {
        id: Date.now().toString(),
        name: folderName,
        type: 'folder',
        modified: new Date(),
        path: '/' + folderName
      };
      setFiles(prev => [...prev, newFolder]);
      showSuccess('Folder created', `"${folderName}" folder created successfully`);
    }
  };

  const handleDelete = () => {
    if (selectedFiles.length === 0) return;
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    showSuccess('Files deleted', `${selectedFiles.length} item(s) deleted`);
    setSelectedFiles([]);
  };

  const handleDownload = (file: FileItem) => {
    // Simulate download
    showSuccess('Download started', `Downloading "${file.name}"`);
  };

  const toggleSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  return (
    <div className="w-full h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-effect border-white/20"
          />
        </div>
        <Button onClick={() => fileInputRef.current?.click()} className="glass-effect">
          <Upload className="w-4 h-4" />
        </Button>
        <Button onClick={handleCreateFolder} className="glass-effect">
          <Plus className="w-4 h-4" />
        </Button>
        {selectedFiles.length > 0 && (
          <Button onClick={handleDelete} variant="destructive" className="glass-effect">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="space-y-2">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`flex items-center gap-3 p-3 rounded-lg glass-effect cursor-pointer transition-all ${
              selectedFiles.includes(file.id) ? 'bg-blue-500/20' : 'hover:bg-white/5'
            }`}
            onClick={() => toggleSelection(file.id)}
          >
            {file.type === 'folder' ? (
              <Folder className="w-5 h-5 text-blue-400" />
            ) : (
              <File className="w-5 h-5 text-gray-400" />
            )}
            <div className="flex-1">
              <div className="font-medium">{file.name}</div>
              <div className="text-sm opacity-70">
                {file.size && `${(file.size / 1024).toFixed(1)} KB • `}
                {file.modified.toLocaleDateString()}
              </div>
            </div>
            {file.type === 'file' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
                className="glass-effect"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedFileExplorer;
