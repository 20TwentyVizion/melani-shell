import { useState, useRef, useEffect } from 'react';
import { Minus, X } from 'lucide-react';

interface MovableWindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  onMinimize: () => void;
  onClose?: () => void;
}

const MovableWindow = ({ title, children, initialPosition, onMinimize, onClose }: MovableWindowProps) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position && windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      const centerX = Math.max(0, (viewportWidth - rect.width) / 2);
      const centerY = Math.max(0, (viewportHeight - rect.height) / 2);
      
      setPosition(initialPosition || { x: centerX, y: centerY });
    }
  }, [initialPosition, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!position) return null;

  return (
    <div
      ref={windowRef}
      className="movable-window animate-fade-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="window-header" onMouseDown={handleMouseDown}>
        <span className="text-sm font-medium">{title}</span>
        <div className="window-controls">
          <button className="window-control-button minimize-button" onClick={onMinimize}>
            <Minus className="w-2 h-2" />
          </button>
          {onClose && (
            <button className="window-control-button close-button" onClick={onClose}>
              <X className="w-2 h-2" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default MovableWindow;