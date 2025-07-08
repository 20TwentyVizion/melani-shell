
import React, { useState, useRef, useEffect } from 'react';
import { Minus, X, Square, Maximize2 } from 'lucide-react';

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
  const [size, setSize] = useState({ width: 400, height: 300 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previousState, setPreviousState] = useState({ position: initialPosition, size: { width: 400, height: 300 } });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile || isMaximized) return;
    
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

  const handleMaximize = () => {
    if (isMaximized) {
      // Restore to previous state
      setPosition(previousState.position);
      setSize(previousState.size);
      setIsMaximized(false);
    } else {
      // Save current state before maximizing
      setPreviousState({ position, size });
      // Maximize
      setPosition({ x: 0, y: 32 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 32 });
      setIsMaximized(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging && !isMobile && !isMaximized) {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - size.width, clientX - dragOffset.x)),
          y: Math.max(32, Math.min(window.innerHeight - size.height, clientY - dragOffset.y))
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
  }, [isDragging, dragOffset, isMobile, isMaximized, size]);

  const windowStyle = isMobile ? {
    position: 'fixed' as const,
    top: '60px',
    left: '10px',
    right: '10px',
    bottom: '80px',
    width: 'auto',
    height: 'auto'
  } : isMaximized ? {
    position: 'fixed' as const,
    top: '32px',
    left: '0px',
    width: '100vw',
    height: 'calc(100vh - 32px)'
  } : {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`
  };

  return (
    <div
      ref={windowRef}
      className={`movable-window animate-fade-in overflow-hidden ${isMaximized ? 'rounded-none' : 'rounded-lg'}`}
      style={windowStyle}
    >
      <div 
        className="window-header" 
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <span className="text-sm font-medium truncate">{title}</span>
        <div className="window-controls">
          <button 
            className="window-control-button minimize-button" 
            onClick={onMinimize}
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          {!isMobile && (
            <button 
              className="window-control-button maximize-button bg-green-500 hover:bg-green-600" 
              onClick={handleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </button>
          )}
          {onClose && (
            <button 
              className="window-control-button close-button" 
              onClick={onClose}
              title="Close"
            >
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
