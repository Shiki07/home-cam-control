
import { useState, useEffect } from 'react';
import { CameraFeed } from '@/components/CameraFeed';
import { EnvironmentalControls } from '@/components/EnvironmentalControls';
import { SecurityPanel } from '@/components/SecurityPanel';
import { DeviceControls } from '@/components/DeviceControls';
import { NotificationPanel } from '@/components/NotificationPanel';
import { SecureHeader } from '@/components/SecureHeader';
import { StatusBar } from '@/components/StatusBar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(true);
  const [securityArmed, setSecurityArmed] = useState(false);

  useEffect(() => {
    // Simulate connection status
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize user devices on first load
    const initializeUserDevices = async () => {
      if (!user) return;

      try {
        // Check if user has any devices registered
        const { data: existingDevices, error } = await supabase
          .from('user_devices')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) {
          console.error('Error checking devices:', error);
          return;
        }

        // If no devices, add some default ones for demo
        if (!existingDevices || existingDevices.length === 0) {
          const defaultDevices = [
            { device_id: 'thermostat_001', device_name: 'Living Room Thermostat', device_type: 'thermostat' },
            { device_id: 'light_001', device_name: 'Kitchen Lights', device_type: 'light' },
            { device_id: 'light_002', device_name: 'Bedroom Lights', device_type: 'light' },
            { device_id: 'camera_001', device_name: 'Front Door Camera', device_type: 'camera' },
            { device_id: 'security_001', device_name: 'Home Security System', device_type: 'security' }
          ];

          for (const device of defaultDevices) {
            await supabase
              .from('user_devices')
              .insert({ ...device, user_id: user.id });
          }

          console.log('Default devices initialized for user');
        }
      } catch (error) {
        console.error('Error initializing devices:', error);
      }
    };

    initializeUserDevices();
  }, [user]);

  const handleSecurityToggle = async (armed: boolean) => {
    setSecurityArmed(armed);
    
    // Log security system changes
    try {
      await supabase.rpc('log_security_event', {
        p_action: armed ? 'security_system_armed' : 'security_system_disarmed',
        p_device_id: 'security_001',
        p_success: true,
        p_details: { armed: armed, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <SecureHeader isConnected={isConnected} />
      <StatusBar securityArmed={securityArmed} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Top Row - Camera and Security */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CameraFeed isConnected={isConnected} />
          </div>
          <div>
            <SecurityPanel 
              isArmed={securityArmed} 
              onToggle={handleSecurityToggle}
              isConnected={isConnected} 
            />
          </div>
        </div>

        {/* Middle Row - Environmental Controls */}
        <EnvironmentalControls isConnected={isConnected} />

        {/* Bottom Row - Device Controls and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DeviceControls isConnected={isConnected} />
          </div>
          <div>
            <NotificationPanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
