import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Save } from 'lucide-react';
import { useToast } from './ui/use-toast';

const TextEditor = () => {
  const [content, setContent] = useState('');
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Document saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 min-h-[200px] resize-none"
        placeholder="Start typing..."
      />
    </div>
  );
};

export default TextEditor;