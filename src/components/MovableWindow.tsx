import { useState, useRef, useEffect } from 'react';
import { Minus, X } from 'lucide-react';

interface MovableWindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  onMinimize: () => void;
  onClose?: () => void;
}

const MovableWindow = ({ title, children, initialPosition = { x: 100, y: 100 }, onMinimize, onClose }: MovableWindowProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

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