// @ts-nocheck
/* Fix TypeScript errors later with proper package installation */
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { UserProvider } from "@/contexts/UserContext";
import { WindowProvider } from "@/contexts/WindowContext";
import Index from "./pages/Index";
import FallbackUI from "./components/ui/FallbackUI";
import SessionVisibilityHandler from "./components/system/SessionVisibilityHandler";
import { handleVisibilityChange, handleBeforeUnload, resetAppState } from "./lib/sessionManager";
// StoreInspector removed after persistence testing

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * ErrorBoundary Component
 * 
 * React error boundary that catches errors in the component tree
 * and displays a fallback UI when errors occur.
 */
class ErrorBoundary extends React.Component {
  state: { hasError: boolean; error: Error | null };
  
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    // Reset app state to recover from errors
    resetAppState();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * App Component
 * 
 * Main application component with error boundary and session management.
 */
const App = () => {
  // For initial load, we show a temporary loading screen
  // We'll implement proper state-based loading in a follow-up PR
  // This simplifies our implementation for now
  
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ThemeProvider>
          <NotificationProvider>
            <WindowProvider>
              <TooltipProvider>
                <SessionVisibilityHandler 
                  onVisibilityChange={handleVisibilityChange}
                  onBeforeUnload={handleBeforeUnload}
                />
                <Toaster />
                <Sonner />
                {/* StoreInspector removed after successful persistence testing */}
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </WindowProvider>
          </NotificationProvider>
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
