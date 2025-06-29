
import { useState, useRef, useEffect } from 'react';
import { Minus, X } from 'lucide-react';

interface MovableWindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  onMinimize: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const MovableWindow = ({ title, children, initialPosition = { x: 100, y: 100 }, onMinimize, onClose, isMobile = false }: MovableWindowProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile) return; // Disable dragging on mobile
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging && !isMobile) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 300, clientX - dragOffset.x)),
          y: Math.max(32, Math.min(window.innerHeight - 200, clientY - dragOffset.y))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging && !isMobile) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMobile]);

  const windowStyle = isMobile ? {
    position: 'fixed' as const,
    top: '60px',
    left: '10px',
    right: '10px',
    bottom: '80px',
    width: 'auto',
    height: 'auto'
  } : {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return (
    <div
      ref={windowRef}
      className="movable-window animate-fade-in overflow-hidden"
      style={windowStyle}
    >
      <div 
        className="window-header" 
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <span className="text-sm font-medium truncate">{title}</span>
        <div className="window-controls">
          <button className="window-control-button minimize-button" onClick={onMinimize}>
            <Minus className="w-3 h-3" />
          </button>
          {onClose && (
            <button className="window-control-button close-button" onClick={onClose}>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4 overflow-auto h-full">
        {children}
      </div>
    </div>
  );
};

export default MovableWindow;
