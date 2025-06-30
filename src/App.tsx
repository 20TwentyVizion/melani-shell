
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <ThemeProvider>
        <NotificationProvider>
          <WindowProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
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
);

export default App;
