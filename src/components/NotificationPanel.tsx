
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export const NotificationPanel = () => {
  const { logs, markAsRead } = useSystemLogs();

  const removeNotification = async (id: string) => {
    await markAsRead(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': 
      case 'security': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'device_control': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning':
      case 'security': return 'border-l-yellow-400';
      case 'error': return 'border-l-red-400';
      case 'device_control': return 'border-l-green-400';
      default: return 'border-l-blue-400';
    }
  };

  const unreadLogs = logs.filter(log => !log.read_at);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <span>Notifications</span>
            {unreadLogs.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadLogs.length}
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border-l-2 ${getBorderColor(log.log_type)} relative group ${
                log.read_at ? 'bg-slate-800/30' : 'bg-slate-700/50'
              }`}
            >
              <button
                onClick={() => removeNotification(log.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-slate-400 hover:text-white" />
              </button>
              
              <div className="flex items-start space-x-3">
                {getIcon(log.log_type)}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium mb-1 ${log.read_at ? 'text-slate-400' : 'text-white'}`}>
                    {log.title}
                  </h4>
                  <p className={`text-xs mb-2 ${log.read_at ? 'text-slate-500' : 'text-slate-300'}`}>
                    {log.message}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
