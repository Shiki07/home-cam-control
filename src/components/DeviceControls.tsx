
import { useDeviceSettings } from '@/hooks/useDeviceSettings';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Lightbulb, Tv, Coffee, Wifi, Lock, Unlock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DeviceControlsProps {
  isConnected: boolean;
}

const deviceConfigs = [
  { name: 'Living Room Lights', type: 'light', icon: Lightbulb, color: 'text-yellow-400' },
  { name: 'Smart TV', type: 'entertainment', icon: Tv, color: 'text-blue-400' },
  { name: 'Coffee Maker', type: 'appliance', icon: Coffee, color: 'text-amber-400' },
  { name: 'WiFi Router', type: 'network', icon: Wifi, color: 'text-green-400' },
];

export const DeviceControls = ({ isConnected }: DeviceControlsProps) => {
  const { deviceSettings, updateDeviceSetting } = useDeviceSettings();
  const { addLog } = useSystemLogs();

  const getDeviceState = (deviceName: string) => {
    const setting = deviceSettings.find(d => d.device_name === deviceName);
    return setting?.is_active ?? false;
  };

  const toggleDevice = async (deviceName: string) => {
    const currentState = getDeviceState(deviceName);
    const newState = !currentState;
    
    await updateDeviceSetting(deviceName, newState);
    await addLog('device_control', `${deviceName} ${newState ? 'On' : 'Off'}`, `Device has been turned ${newState ? 'on' : 'off'}`);
    
    toast({
      title: `${deviceName} ${newState ? 'On' : 'Off'}`,
      description: `Device has been turned ${newState ? 'on' : 'off'}`,
    });
  };

  const toggleAllDevices = async (state: boolean) => {
    for (const device of deviceConfigs) {
      await updateDeviceSetting(device.name, state);
    }
    await addLog('device_control', `All devices ${state ? 'on' : 'off'}`, `All devices have been turned ${state ? 'on' : 'off'}`);
    toast({ title: `All devices turned ${state ? 'on' : 'off'}` });
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
          {deviceConfigs.map((device) => {
            const IconComponent = device.icon;
            const isOn = getDeviceState(device.name);
            
            return (
              <div
                key={device.name}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  isOn 
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
                    checked={isOn}
                    onCheckedChange={() => toggleDevice(device.name)}
                    disabled={!isConnected}
                  />
                </div>
                <div className="text-xs text-slate-400 capitalize">
                  {device.type} • {isOn ? 'Active' : 'Inactive'}
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
              onClick={() => toggleAllDevices(true)}
            >
              All On
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={!isConnected}
              onClick={() => toggleAllDevices(false)}
            >
              All Off
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
