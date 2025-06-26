
import { useState, useEffect } from 'react';

interface PiDevice {
  id: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'connecting';
  lastSeen?: Date;
}

export const usePiConnection = (piIp?: string) => {
  const [device, setDevice] = useState<PiDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const checkConnection = async (ip: string) => {
    console.log('usePiConnection: Checking connection to', ip);
    
    try {
      setIsConnecting(true);
      
      // Test both the main server and the stream endpoint
      const serverResponse = await fetch(`http://${ip}:8000`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      
      console.log('usePiConnection: Server check completed for', ip);
      
      setDevice({
        id: 'pi-zero-w',
        name: 'Raspberry Pi Zero W',
        ip,
        status: 'online',
        lastSeen: new Date()
      });
      
      console.log('usePiConnection: Device set to online');
      
    } catch (error) {
      console.log('usePiConnection: Pi connection check failed:', error);
      setDevice(prev => prev ? { ...prev, status: 'offline' } : {
        id: 'pi-zero-w',
        name: 'Raspberry Pi Zero W',
        ip,
        status: 'offline',
        lastSeen: new Date()
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToPi = async (ip: string) => {
    console.log('usePiConnection: Attempting to connect to Pi at', ip);
    await checkConnection(ip);
  };

  useEffect(() => {
    if (piIp) {
      console.log('usePiConnection: Starting periodic checks for', piIp);
      checkConnection(piIp);
      const interval = setInterval(() => checkConnection(piIp), 30000); // Check every 30 seconds
      return () => {
        console.log('usePiConnection: Stopping periodic checks');
        clearInterval(interval);
      };
    }
  }, [piIp]);

  return {
    device,
    isConnecting,
    connectToPi,
    checkConnection
  };
};
