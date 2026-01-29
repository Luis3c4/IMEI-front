import { Smartphone, LogIn, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  user: { name: string } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  title?: string;
  description?: string;
}

const Header = ({ user, onLoginClick, onLogoutClick, title = "IMEI Check", description = "Consultor de dispositivos" }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full py-2 px-4 animate-fade-in bg-background border-b">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-10 h-10 rounded-lg gradient-primary items-center justify-center shadow-button-primary">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="md:hidden">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md">
                <User className="w-4 h-4" />
                <span className="max-w-30 truncate text-sm font-medium">{user.name}</span>
              </div>
              <Button variant="outline" onClick={onLogoutClick} size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">log out</span>
              </Button>
            </>
          ) : (
            <Button variant="login" onClick={onLoginClick} className="gap-2">
              <LogIn className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
