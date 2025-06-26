
import { useState, useEffect } from 'react';
import { CameraFeed } from '@/components/CameraFeed';
import { EnvironmentalControls } from '@/components/EnvironmentalControls';
import { SecurityPanel } from '@/components/SecurityPanel';
import { DeviceControls } from '@/components/DeviceControls';
import { NotificationPanel } from '@/components/NotificationPanel';
import { PiDeviceManager } from '@/components/PiDeviceManager';
import { Header } from '@/components/Header';
import { StatusBar } from '@/components/StatusBar';

const Index = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [securityArmed, setSecurityArmed] = useState(false);
  const [piIp, setPiIp] = useState(localStorage.getItem('pi-ip') || '');

  useEffect(() => {
    // Simulate connection status
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Listen for Pi IP changes from localStorage
    const handleStorageChange = () => {
      setPiIp(localStorage.getItem('pi-ip') || '');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Header isConnected={isConnected} />
      <StatusBar securityArmed={securityArmed} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Top Row - Device Manager */}
        <PiDeviceManager />

        {/* Second Row - Camera and Security */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CameraFeed isConnected={isConnected} piIp={piIp} />
          </div>
          <div>
            <SecurityPanel 
              isArmed={securityArmed} 
              onToggle={setSecurityArmed}
              isConnected={isConnected} 
            />
          </div>
        </div>

        {/* Third Row - Environmental Controls */}
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
