
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
    try {
      setIsConnecting(true);
      const response = await fetch(`http://${ip}:8000`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      
      setDevice({
        id: 'pi-zero-w',
        name: 'Raspberry Pi Zero W',
        ip,
        status: 'online',
        lastSeen: new Date()
      });
    } catch (error) {
      console.log('Pi connection check failed:', error);
      setDevice(prev => prev ? { ...prev, status: 'offline' } : null);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToPi = async (ip: string) => {
    await checkConnection(ip);
  };

  useEffect(() => {
    if (piIp) {
      checkConnection(piIp);
      const interval = setInterval(() => checkConnection(piIp), 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [piIp]);

  return {
    device,
    isConnecting,
    connectToPi,
    checkConnection
  };
};
