
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Settings, RefreshCw } from 'lucide-react';
import { usePiConnection } from '@/hooks/usePiConnection';
import { toast } from 'sonner';

export const PiDeviceManager = () => {
  const [piIp, setPiIp] = useState(localStorage.getItem('pi-ip') || '');
  const { device, isConnecting, connectToPi, checkConnection } = usePiConnection(piIp);

  const handleConnect = async () => {
    if (!piIp) {
      toast.error('Please enter your Pi\'s IP address');
      return;
    }

    try {
      await connectToPi(piIp);
      localStorage.setItem('pi-ip', piIp);
      toast.success('Connected to Raspberry Pi!');
    } catch (error) {
      toast.error('Failed to connect to Pi. Check IP and network connection.');
    }
  };

  const handleRefresh = () => {
    if (piIp) {
      checkConnection(piIp);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-teal-400" />
            <span>Pi Device Manager</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isConnecting}
          >
            <RefreshCw className={`h-4 w-4 ${isConnecting ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pi-ip" className="text-slate-300">Pi IP Address</Label>
          <div className="flex space-x-2">
            <Input
              id="pi-ip"
              placeholder="192.168.1.100"
              value={piIp}
              onChange={(e) => setPiIp(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </div>

        {device && (
          <div className="space-y-3 p-3 bg-slate-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{device.name}</span>
              <Badge 
                variant={device.status === 'online' ? 'default' : 'destructive'}
                className={device.status === 'online' ? 'bg-green-600' : ''}
              >
                <div className="flex items-center space-x-1">
                  {device.status === 'online' ? (
                    <Wifi className="h-3 w-3" />
                  ) : (
                    <WifiOff className="h-3 w-3" />
                  )}
                  <span>{device.status}</span>
                </div>
              </Badge>
            </div>
            <div className="text-sm text-slate-400">
              <p>IP: {device.ip}</p>
              {device.lastSeen && (
                <p>Last seen: {device.lastSeen.toLocaleTimeString()}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
