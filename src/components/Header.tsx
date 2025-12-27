import { Smartphone, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user: { name: string } | null;
  onLoginClick: () => void;
  onUserClick: () => void;
}

const Header = ({ user, onLoginClick, onUserClick }: HeaderProps) => {
  return (
    <header className="w-full py-6 px-4 animate-fade-in">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-button-primary">
            <Smartphone className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-foreground">IMEI Check</h1>
            <p className="text-xs text-muted-foreground">Consultor de dispositivos</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Button 
              variant="user" 
              onClick={onUserClick}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              <span className="max-w-30 truncate">{user.name}</span>
            </Button>
          ) : (
            <Button 
              variant="login" 
              onClick={onLoginClick}
              className="gap-2"
            >
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
