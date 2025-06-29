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
  onCalendarClick: () => void;
  onMusicClick: () => void;
  isMobile?: boolean;
}

const DockItem = ({ icon: Icon, label, onClick, isMobile }: { icon: any, label: string, onClick?: () => void, isMobile?: boolean }) => {
  const ItemContent = (
    <div className={`dock-item ${isMobile ? 'p-3' : 'p-2'} rounded-xl glass-effect`} onClick={onClick}>
      <Icon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
    </div>
  );

  if (isMobile) {
    return ItemContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {ItemContent}
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Dock = ({ onSettingsClick, onFilesClick, onCalendarClick, onMusicClick, isMobile = false }: DockProps) => {
  const apps = [
    { icon: Home, label: 'Home' },
    { icon: FolderOpen, label: 'Files', onClick: onFilesClick },
    { icon: Mail, label: 'Mail' },
    { icon: Calendar, label: 'Calendar', onClick: onCalendarClick },
    { icon: Music, label: 'Music', onClick: onMusicClick },
    { icon: Settings, label: 'Settings', onClick: onSettingsClick },
  ];

  return (
    <div className={`fixed ${isMobile ? 'bottom-2 left-2 right-2' : 'bottom-4 left-1/2 transform -translate-x-1/2'} ${isMobile ? 'px-4 py-2' : 'px-6 py-2'} rounded-2xl glass-effect animate-fade-in`}>
      <div className={`flex ${isMobile ? 'justify-around' : 'space-x-2'}`}>
        {apps.map((app, index) => (
          <DockItem key={index} icon={app.icon} label={app.label} onClick={app.onClick} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
};

export default Dock;
