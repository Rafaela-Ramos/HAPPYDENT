import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  Calendar, 
  Wrench, 
  ClipboardList, 
  CreditCard, 
  User,
  LogOut
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, current: false },
  { name: 'Pacientes', href: '/patients', icon: Users, current: false },
  { name: 'Citas', href: '/appointments', icon: Calendar, current: false },
  { name: 'Servicios', href: '/services', icon: Wrench, current: false },
  { name: 'Servicios Aplicados', href: '/applied-services', icon: ClipboardList, current: false },
  { name: 'Pagos', href: '/payments', icon: CreditCard, current: false },
  { name: 'Perfil', href: '/profile', icon: User, current: false },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { collapsed, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={cn(
      "fixed left-0 top-0 z-40 flex flex-col h-screen bg-gradient-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <button 
          onClick={toggleSidebar}
          className="flex items-center space-x-3 w-full hover:bg-accent/10 rounded-lg p-1 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
            <img 
              src="/img/logo_DentoPro.png" 
              alt="DentoPro Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          {!collapsed && (
            <div className="text-left">
              <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                DentoPro
              </h1>
              <p className="text-xs text-muted-foreground">Gestión Dental</p>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start transition-smooth",
                collapsed ? "px-3" : "px-3",
                isActive && "bg-gradient-primary shadow-card"
              )}
              size={collapsed ? "sm" : "default"}
              asChild
            >
              <Link to={item.href}>
                <Icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && item.name}
              </Link>
            </Button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-border">
        {!collapsed && user && (
          <div className="mb-3 p-2 rounded-lg bg-accent/5">
            <p className="text-sm font-medium text-foreground truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role || 'Odontólogo'}
            </p>
          </div>
        )}
        
        <Button
          variant="ghost"
          className={cn(
            "w-full text-muted-foreground hover:text-foreground hover:bg-red-50 hover:border-red-200",
            collapsed ? "px-3" : "justify-start px-3"
          )}
          size={collapsed ? "sm" : "default"}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-3")} />
          {!collapsed && "Cerrar Sesión"}
        </Button>
      </div>

    </div>
  );
}