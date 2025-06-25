
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SecurityPanelProps {
  isArmed: boolean;
  onToggle: (armed: boolean) => void;
  isConnected: boolean;
}

export const SecurityPanel = ({ isArmed, onToggle, isConnected }: SecurityPanelProps) => {
  const handleToggleSecurity = () => {
    const newState = !isArmed;
    onToggle(newState);
    toast({
      title: newState ? "Security Armed" : "Security Disarmed",
      description: newState ? "Your home is now protected" : "Security system disabled",
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Shield className="h-5 w-5 text-red-400" />
          <span>Security System</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            isArmed ? 'bg-red-500/20 border-2 border-red-500' : 'bg-slate-700 border-2 border-slate-600'
          }`}>
            {isArmed ? (
              <ShieldCheck className="h-10 w-10 text-red-400" />
            ) : (
              <Shield className="h-10 w-10 text-slate-400" />
            )}
          </div>
          
          <Button
            onClick={handleToggleSecurity}
            disabled={!isConnected}
            className={`w-full ${
              isArmed 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {isArmed ? 'Disarm System' : 'Arm System'}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-slate-300">Front Door</span>
            </div>
            <span className="text-xs text-green-400">Locked</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Motion Sensors</span>
            </div>
            <span className={`text-xs ${isArmed ? 'text-red-400' : 'text-slate-400'}`}>
              {isArmed ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Unlock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-300">Back Door</span>
            </div>
            <span className="text-xs text-green-400">Locked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
