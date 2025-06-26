
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DeviceSetting {
  id: string;
  device_name: string;
  device_type: string;
  settings: any;
  is_active: boolean;
}

export const useDeviceSettings = () => {
  const [deviceSettings, setDeviceSettings] = useState<DeviceSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDeviceSettings();
    }
  }, [user]);

  const fetchDeviceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('device_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeviceSettings(data || []);
    } catch (error) {
      console.error('Error fetching device settings:', error);
      toast.error('Failed to load device settings');
    } finally {
      setLoading(false);
    }
  };

  const updateDeviceSetting = async (deviceName: string, isActive: boolean, settings?: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('device_settings')
        .upsert({
          user_id: user.id,
          device_name: deviceName,
          device_type: 'smart_device',
          is_active: isActive,
          settings: settings || {},
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_name'
        });

      if (error) throw error;
      await fetchDeviceSettings();
    } catch (error) {
      console.error('Error updating device setting:', error);
      toast.error('Failed to update device setting');
    }
  };

  return {
    deviceSettings,
    loading,
    updateDeviceSetting,
    refetch: fetchDeviceSettings
  };
};
