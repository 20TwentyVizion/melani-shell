import React from 'react';
const { useState, useRef, useEffect } = React;
import { Minus, X, Square, Maximize2 } from 'lucide-react';

interface MovableWindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onMinimize: () => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const MovableWindow = ({ 
  title, 
  children, 
  initialPosition = { x: 100, y: 100 }, 
  initialSize = { width: 400, height: 300 },
  onMinimize, 
  onClose, 
  isMobile = false 
}: MovableWindowProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [previousState, setPreviousState] = useState({ position: initialPosition, size: initialSize });
  const windowRef = useRef<HTMLDivElement>(null);
  const resizeStartPosition = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });

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
  
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, direction: string) => {
    if (isMobile || isMaximized) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    resizeStartPosition.current = { x: clientX, y: clientY };
    resizeStartSize.current = { width: size.width, height: size.height };
    
    setResizeDirection(direction);
    setIsResizing(true);
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

  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing || isMobile || isMaximized) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - resizeStartPosition.current.x;
    const deltaY = clientY - resizeStartPosition.current.y;
    
    const minWidth = 250;
    const minHeight = 200;
    
    let newWidth = resizeStartSize.current.width;
    let newHeight = resizeStartSize.current.height;
    let newX = position.x;
    let newY = position.y;
    
    // Handle resize based on direction
    if (resizeDirection?.includes('e')) {
      newWidth = Math.max(minWidth, resizeStartSize.current.width + deltaX);
    }
    if (resizeDirection?.includes('w')) {
      const maxLeftMove = resizeStartSize.current.width - minWidth;
      const actualDeltaX = Math.max(-maxLeftMove, Math.min(deltaX, window.innerWidth - position.x));
      newWidth = resizeStartSize.current.width - actualDeltaX;
      newX = resizeStartPosition.current.x + actualDeltaX <= 0 ? position.x : 
             position.x + actualDeltaX;
    }
    if (resizeDirection?.includes('s')) {
      newHeight = Math.max(minHeight, resizeStartSize.current.height + deltaY);
    }
    if (resizeDirection?.includes('n')) {
      const maxTopMove = resizeStartSize.current.height - minHeight;
      const actualDeltaY = Math.max(-maxTopMove, Math.min(deltaY, window.innerHeight - position.y));
      newHeight = resizeStartSize.current.height - actualDeltaY;
      newY = resizeStartPosition.current.y + actualDeltaY <= 32 ? position.y : 
             position.y + actualDeltaY;
    }
    
    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
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
      } else if (isResizing && !isMobile && !isMaximized) {
        handleResizeMove(e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if ((isDragging || isResizing) && !isMobile) {
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
  }, [isDragging, isResizing, dragOffset, isMobile, isMaximized, size, position]);

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

  // Add resize handles styling
  const cursorMap: Record<string, string> = {
    n: 'cursor-n-resize',
    e: 'cursor-e-resize',
    s: 'cursor-s-resize',
    w: 'cursor-w-resize',
    ne: 'cursor-ne-resize',
    nw: 'cursor-nw-resize',
    se: 'cursor-se-resize',
    sw: 'cursor-sw-resize'
  };

  // Resize handles
  const resizeHandles = !isMobile && !isMaximized ? (
    <>
      <div className={`absolute top-0 left-0 right-0 h-1 ${cursorMap.n}`} onMouseDown={(e) => handleResizeStart(e, 'n')} onTouchStart={(e) => handleResizeStart(e, 'n')} />
      <div className={`absolute top-0 right-0 bottom-0 w-1 ${cursorMap.e}`} onMouseDown={(e) => handleResizeStart(e, 'e')} onTouchStart={(e) => handleResizeStart(e, 'e')} />
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${cursorMap.s}`} onMouseDown={(e) => handleResizeStart(e, 's')} onTouchStart={(e) => handleResizeStart(e, 's')} />
      <div className={`absolute top-0 left-0 bottom-0 w-1 ${cursorMap.w}`} onMouseDown={(e) => handleResizeStart(e, 'w')} onTouchStart={(e) => handleResizeStart(e, 'w')} />
      <div className={`absolute top-0 right-0 w-2 h-2 ${cursorMap.ne}`} onMouseDown={(e) => handleResizeStart(e, 'ne')} onTouchStart={(e) => handleResizeStart(e, 'ne')} />
      <div className={`absolute top-0 left-0 w-2 h-2 ${cursorMap.nw}`} onMouseDown={(e) => handleResizeStart(e, 'nw')} onTouchStart={(e) => handleResizeStart(e, 'nw')} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 ${cursorMap.se}`} onMouseDown={(e) => handleResizeStart(e, 'se')} onTouchStart={(e) => handleResizeStart(e, 'se')} />
      <div className={`absolute bottom-0 left-0 w-2 h-2 ${cursorMap.sw}`} onMouseDown={(e) => handleResizeStart(e, 'sw')} onTouchStart={(e) => handleResizeStart(e, 'sw')} />
    </>
  ) : null;

  return (
    <div
      ref={windowRef}
      className={`movable-window animate-fade-in overflow-hidden ${isMaximized ? 'rounded-none' : 'rounded-lg'} ${isResizing ? 'select-none' : ''}`}
      style={windowStyle}
    >
      {resizeHandles}
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
