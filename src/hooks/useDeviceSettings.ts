
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sanitizeDeviceName } from '@/utils/inputSanitization';

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
    if (!user) {
      toast.error('Authentication required');
      return;
    }

    try {
      // Enhanced input validation and sanitization
      const sanitizedDeviceName = sanitizeDeviceName(deviceName);
      
      if (!sanitizedDeviceName || sanitizedDeviceName.trim().length === 0) {
        toast.error('Device name is required');
        return;
      }

      if (sanitizedDeviceName.length > 50) {
        toast.error('Device name is too long (max 50 characters)');
        return;
      }

      // Validate settings object if provided
      let sanitizedSettings = {};
      if (settings && typeof settings === 'object') {
        // Only allow specific setting keys to prevent injection
        const allowedKeys = ['brightness', 'temperature', 'color', 'schedule', 'enabled'];
        Object.keys(settings).forEach(key => {
          if (allowedKeys.includes(key)) {
            sanitizedSettings[key] = settings[key];
          }
        });
      }

      const { error } = await supabase
        .from('device_settings')
        .upsert({
          user_id: user.id,
          device_name: sanitizedDeviceName,
          device_type: 'smart_device',
          is_active: isActive,
          settings: sanitizedSettings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_name'
        });

      if (error) {
        console.error('Database error:', error);
        toast.error('Failed to update device setting');
        return;
      }
      
      await fetchDeviceSettings();
      toast.success(`Device "${sanitizedDeviceName}" updated successfully`);
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
