
import { useState, useEffect } from 'react';
import { Search, File, Calendar, User, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SearchResult {
  id: string;
  title: string;
  type: 'file' | 'app' | 'setting' | 'contact';
  icon: React.ComponentType;
  action: () => void;
}

const GlobalSearch = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Mock search data
  const searchData: SearchResult[] = [
    { id: '1', title: 'Calculator', type: 'app', icon: Settings, action: () => {} },
    { id: '2', title: 'Notes App', type: 'app', icon: File, action: () => {} },
    { id: '3', title: 'Calendar', type: 'app', icon: Calendar, action: () => {} },
    { id: '4', title: 'User Profile', type: 'setting', icon: User, action: () => {} },
    { id: '5', title: 'README.txt', type: 'file', icon: File, action: () => {} },
    { id: '6', title: 'Meeting Notes', type: 'file', icon: File, action: () => {} },
  ];

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = searchData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    result.action();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
      <Card className="w-full max-w-2xl mx-4 glass-effect border-none">
        <CardContent className="p-0">
          <div className="relative">
            <Search size={20} color="#9CA3AF" className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            <Input
              placeholder="Search apps, files, and settings..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-none glass-effect"
              autoFocus
            />
          </div>
          
          {results.length > 0 && (
            <div className="border-t border-white/10 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <result.icon size={20} color="#9CA3AF" />
                  <div>
                    <div className="font-medium">{result.title}</div>
                    <div className="text-sm opacity-70 capitalize">{result.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalSearch;
