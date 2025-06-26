
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeLogMessage } from '@/utils/inputSanitization';

interface SystemLog {
  id: string;
  log_type: string;
  title: string;
  message: string;
  metadata: any;
  read_at: string | null;
  created_at: string;
}

export const useSystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50); // Increased limit but still reasonable

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logType: string, title: string, message: string, metadata?: any) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Enhanced input validation and sanitization
      const sanitizedLogType = logType?.trim().toLowerCase();
      const sanitizedTitle = title?.trim();
      const sanitizedMessage = sanitizeLogMessage(message || '');

      // Validate log type against allowed values
      const allowedLogTypes = ['info', 'warning', 'error', 'security', 'device', 'system'];
      if (!sanitizedLogType || !allowedLogTypes.includes(sanitizedLogType)) {
        console.error('Invalid log type:', logType);
        return;
      }

      if (!sanitizedTitle || sanitizedTitle.length === 0) {
        console.error('Log title is required');
        return;
      }

      if (sanitizedTitle.length > 100) {
        console.error('Log title is too long');
        return;
      }

      // Sanitize metadata if provided
      let sanitizedMetadata = {};
      if (metadata && typeof metadata === 'object') {
        // Only allow specific metadata keys
        const allowedMetadataKeys = ['device_id', 'ip_address', 'user_agent', 'action', 'timestamp'];
        Object.keys(metadata).forEach(key => {
          if (allowedMetadataKeys.includes(key) && typeof metadata[key] === 'string') {
            sanitizedMetadata[key] = metadata[key].toString().substring(0, 100);
          }
        });
      }

      const { error } = await supabase
        .from('system_logs')
        .insert({
          user_id: user.id,
          log_type: sanitizedLogType,
          title: sanitizedTitle,
          message: sanitizedMessage,
          metadata: sanitizedMetadata
        });

      if (error) {
        console.error('Database error:', error);
        return;
      }
      
      await fetchLogs();
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const markAsRead = async (logId: string) => {
    try {
      if (!logId || logId.trim().length === 0) {
        console.error('Log ID is required');
        return;
      }

      // Validate UUID format to prevent injection
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(logId)) {
        console.error('Invalid log ID format');
        return;
      }

      const { error } = await supabase
        .from('system_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('id', logId);

      if (error) {
        console.error('Database error:', error);
        return;
      }
      
      await fetchLogs();
    } catch (error) {
      console.error('Error marking log as read:', error);
    }
  };

  return {
    logs,
    loading,
    addLog,
    markAsRead,
    refetch: fetchLogs
  };
};
