import { Sidebar } from "./Sidebar";
import { useSidebar } from "@/hooks/use-sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useSidebar(); // Initialize sidebar state and CSS variables

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div 
        className="flex flex-col transition-all duration-300 min-h-screen"
        style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
      >
        {children}
      </div>
    </div>
  );
}