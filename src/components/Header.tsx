
import { Wifi, WifiOff, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isConnected: boolean;
}

export const Header = ({ isConnected }: HeaderProps) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Home className="h-8 w-8 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Home Control</h1>
            <p className="text-sm text-slate-400">Raspberry Pi Zero Remote Access</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
