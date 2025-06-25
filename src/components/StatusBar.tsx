
import { Shield, ShieldOff, Clock } from 'lucide-react';

interface StatusBarProps {
  securityArmed: boolean;
}

export const StatusBar = ({ securityArmed }: StatusBarProps) => {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="bg-slate-800/30 border-b border-slate-700 py-2">
      <div className="container mx-auto px-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {securityArmed ? (
              <Shield className="h-4 w-4 text-red-400" />
            ) : (
              <ShieldOff className="h-4 w-4 text-slate-400" />
            )}
            <span className={securityArmed ? 'text-red-400' : 'text-slate-400'}>
              Security {securityArmed ? 'Armed' : 'Disarmed'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-slate-400">
          <Clock className="h-4 w-4" />
          <span>{currentTime}</span>
        </div>
      </div>
    </div>
  );
};
