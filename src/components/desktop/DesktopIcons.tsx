
import { Bot, AppWindow, UserRound, Gamepad2, FileText, Calculator as CalcIcon, CheckSquare, Search, Store } from 'lucide-react';

interface DesktopIconsProps {
  isMobile: boolean;
  onIconClick: (iconType: string) => void;
}

const DesktopIcons = ({ isMobile, onIconClick }: DesktopIconsProps) => {
  const desktopIcons = [
    { icon: Bot, label: 'Melani', type: 'melani' },
    { icon: AppWindow, label: 'Recent', type: 'recent' },
    { icon: UserRound, label: 'Profile', type: 'profile' },
    { icon: Gamepad2, label: 'Games', type: 'games' },
    { icon: FileText, label: 'Notes', type: 'notes' },
    { icon: CalcIcon, label: 'Calculator', type: 'calculator' },
    { icon: CheckSquare, label: 'Tasks', type: 'tasks' },
    { icon: Search, label: 'Search', type: 'search' },
    { icon: Store, label: 'App Store', type: 'appStore' },
  ];

  if (isMobile) {
    return (
      <div className="pt-12 pb-20 px-4">
        <div className="grid grid-cols-3 gap-4">
          {desktopIcons.map((icon, index) => (
            <div
              key={index}
              className="desktop-icon bg-black/20 rounded-xl"
              onClick={() => onIconClick(icon.type)}
            >
              <icon.icon className="w-8 h-8 text-white/80 mb-2" />
              <span className="text-sm text-center">{icon.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {desktopIcons.map((icon, index) => (
        <div 
          key={index}
          className="desktop-icon"
          style={{ left: '20px', top: `${40 + index * 90}px` }}
          onClick={() => onIconClick(icon.type)}
        >
          <icon.icon className="w-8 h-8 text-white/80" />
          <span className="text-xs mt-2">{icon.label}</span>
        </div>
      ))}
    </>
  );
};

export default DesktopIcons;
