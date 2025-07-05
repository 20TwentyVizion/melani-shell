
import { useEffect } from 'react';

const FluidAnimations = () => {
  useEffect(() => {
    // Add global smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add stagger animation to desktop icons
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach((icon, index) => {
      (icon as HTMLElement).style.animationDelay = `${index * 50}ms`;
      icon.classList.add('animate-fade-in');
    });

    // Enhanced window animations
    const observeWindowAnimations = () => {
      const windows = document.querySelectorAll('.movable-window');
      windows.forEach(window => {
        if (!window.classList.contains('animate-scale-up')) {
          window.classList.add('animate-scale-up');
        }
      });
    };

    // Observe for new windows
    const observer = new MutationObserver(observeWindowAnimations);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component only adds animations, no visual rendering
};

export default FluidAnimations;
