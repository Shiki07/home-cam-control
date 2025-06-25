
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, Tv, Coffee, Wifi, Lock, Unlock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DeviceControlsProps {
  isConnected: boolean;
}

interface Device {
  id: string;
  name: string;
  type: string;
  isOn: boolean;
  icon: any;
  color: string;
}

export const DeviceControls = ({ isConnected }: DeviceControlsProps) => {
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'Living Room Lights', type: 'light', isOn: true, icon: Lightbulb, color: 'text-yellow-400' },
    { id: '2', name: 'Smart TV', type: 'entertainment', isOn: false, icon: Tv, color: 'text-blue-400' },
    { id: '3', name: 'Coffee Maker', type: 'appliance', isOn: false, icon: Coffee, color: 'text-amber-400' },
    { id: '4', name: 'WiFi Router', type: 'network', isOn: true, icon: Wifi, color: 'text-green-400' },
  ]);

  const toggleDevice = (deviceId: string) => {
    setDevices(devices.map(device => {
      if (device.id === deviceId) {
        const newState = !device.isOn;
        toast({
          title: `${device.name} ${newState ? 'On' : 'Off'}`,
          description: `Device has been turned ${newState ? 'on' : 'off'}`,
        });
        return { ...device, isOn: newState };
      }
      return device;
    }));
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-white">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          <span>Device Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {devices.map((device) => {
            const IconComponent = device.icon;
            return (
              <div
                key={device.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  device.isOn 
                    ? 'bg-slate-700/50 border-slate-600' 
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-5 w-5 ${device.color}`} />
                    <span className="text-white font-medium">{device.name}</span>
                  </div>
                  <Switch
                    checked={device.isOn}
                    onCheckedChange={() => toggleDevice(device.id)}
                    disabled={!isConnected}
                  />
                </div>
                <div className="text-xs text-slate-400 capitalize">
                  {device.type} • {device.isOn ? 'Active' : 'Inactive'}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={!isConnected}
              onClick={() => {
                setDevices(devices.map(device => ({ ...device, isOn: true })));
                toast({ title: "All devices turned on" });
              }}
            >
              All On
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={!isConnected}
              onClick={() => {
                setDevices(devices.map(device => ({ ...device, isOn: false })));
                toast({ title: "All devices turned off" });
              }}
            >
              All Off
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
