
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface DeviceControlParams {
  deviceId: string;
  action: string;
  value?: any;
  deviceType?: string;
}

export const useSecureDeviceControl = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const validateInput = (params: DeviceControlParams): boolean => {
    // Validate device ID format
    if (!params.deviceId || typeof params.deviceId !== 'string' || params.deviceId.trim().length === 0) {
      toast({
        title: "Invalid Device",
        description: "Device ID is required and must be a valid string.",
        variant: "destructive",
      });
      return false;
    }

    // Validate action
    const allowedActions = ['toggle', 'set_temperature', 'set_brightness', 'arm', 'disarm', 'capture'];
    if (!params.action || !allowedActions.includes(params.action)) {
      toast({
        title: "Invalid Action",
        description: "The requested action is not allowed.",
        variant: "destructive",
      });
      return false;
    }

    // Validate value ranges based on action
    if (params.action === 'set_temperature' && params.value !== undefined) {
      const temp = Number(params.value);
      if (isNaN(temp) || temp < 50 || temp > 90) {
        toast({
          title: "Invalid Temperature",
          description: "Temperature must be between 50°F and 90°F.",
          variant: "destructive",
        });
        return false;
      }
    }

    if (params.action === 'set_brightness' && params.value !== undefined) {
      const brightness = Number(params.value);
      if (isNaN(brightness) || brightness < 0 || brightness > 100) {
        toast({
          title: "Invalid Brightness",
          description: "Brightness must be between 0% and 100%.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const executeDeviceControl = async (params: DeviceControlParams) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to control devices.",
        variant: "destructive",
      });
      return { success: false, error: 'Not authenticated' };
    }

    if (!validateInput(params)) {
      return { success: false, error: 'Invalid input parameters' };
    }

    setIsLoading(true);

    try {
      // Check if user owns this device
      const { data: deviceCheck, error: deviceError } = await supabase
        .from('user_devices')
        .select('id, device_name, is_active')
        .eq('device_id', params.deviceId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (deviceError) {
        console.error('Device check error:', deviceError);
        throw new Error('Failed to verify device ownership');
      }

      if (!deviceCheck) {
        await supabase.rpc('log_security_event', {
          p_action: 'unauthorized_device_access_attempt',
          p_device_id: params.deviceId,
          p_success: false,
          p_details: { action: params.action, reason: 'device_not_owned' }
        });

        toast({
          title: "Access Denied",
          description: "You don't have permission to control this device.",
          variant: "destructive",
        });
        return { success: false, error: 'Device not owned by user' };
      }

      if (!deviceCheck.is_active) {
        toast({
          title: "Device Inactive",
          description: "This device is currently inactive and cannot be controlled.",
          variant: "destructive",
        });
        return { success: false, error: 'Device is inactive' };
      }

      // Log the control action
      await supabase.rpc('log_security_event', {
        p_action: `device_control_${params.action}`,
        p_device_id: params.deviceId,
        p_success: true,
        p_details: {
          device_name: deviceCheck.device_name,
          action: params.action,
          value: params.value,
          device_type: params.deviceType
        }
      });

      // Simulate device control (in real implementation, this would call your Pi API)
      console.log(`Controlling device ${params.deviceId}: ${params.action}`, params.value);

      toast({
        title: "Device Controlled",
        description: `Successfully executed ${params.action} on ${deviceCheck.device_name}`,
      });

      return { success: true, data: { deviceName: deviceCheck.device_name } };

    } catch (error) {
      console.error('Device control error:', error);
      
      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_action: `device_control_failed`,
        p_device_id: params.deviceId,
        p_success: false,
        p_details: {
          action: params.action,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      toast({
        title: "Control Failed",
        description: "Failed to control device. Please try again.",
        variant: "destructive",
      });

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeDeviceControl,
    isLoading
  };
};
