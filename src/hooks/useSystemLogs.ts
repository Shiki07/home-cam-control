
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logType: string, title: string, message: string, metadata?: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          user_id: user.id,
          log_type: logType,
          title,
          message,
          metadata: metadata || {}
        });

      if (error) throw error;
      await fetchLogs();
    } catch (error) {
      console.error('Error adding log:', error);
    }
  };

  const markAsRead = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('system_logs')
        .update({ read_at: new Date().toISOString() })
        .eq('id', logId);

      if (error) throw error;
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
