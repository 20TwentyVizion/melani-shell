import { 
  Home, 
  Settings, 
  FolderOpen, 
  Mail, 
  Calendar,
  Music
} from 'lucide-react';
import { Tooltip } from "@/components/ui/tooltip"
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DockProps {
  onSettingsClick: () => void;
  onFilesClick: () => void;
}

const DockItem = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <div className="dock-item p-2 rounded-xl glass-effect" onClick={onClick}>
          <Icon className="w-8 h-8" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const Dock = ({ onSettingsClick, onFilesClick }: DockProps) => {
  const apps = [
    { icon: Home, label: 'Home' },
    { icon: FolderOpen, label: 'Files', onClick: onFilesClick },
    { icon: Mail, label: 'Mail' },
    { icon: Calendar, label: 'Calendar' },
    { icon: Music, label: 'Music' },
    { icon: Settings, label: 'Settings', onClick: onSettingsClick },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-2xl glass-effect animate-fade-in">
      <div className="flex space-x-2">
        {apps.map((app, index) => (
          <DockItem key={index} icon={app.icon} label={app.label} onClick={app.onClick} />
        ))}
      </div>
    </div>
  );
};

export default Dock;