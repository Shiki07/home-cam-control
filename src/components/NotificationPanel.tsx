
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

export const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Motion Detected',
      message: 'Front door camera detected movement',
      timestamp: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      id: '2',
      type: 'info',
      title: 'Temperature Alert',
      message: 'Living room temperature is 25°C',
      timestamp: new Date(Date.now() - 600000) // 10 minutes ago
    },
    {
      id: '3',
      type: 'success',
      title: 'System Update',
      message: 'Raspberry Pi firmware updated successfully',
      timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new notifications
      if (Math.random() > 0.8) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: Math.random() > 0.5 ? 'info' : 'warning',
          title: Math.random() > 0.5 ? 'Sensor Update' : 'Device Status',
          message: Math.random() > 0.5 ? 'Humidity sensor reading updated' : 'Coffee maker cycle completed',
          timestamp: new Date()
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-yellow-400';
      case 'error': return 'border-l-red-400';
      case 'success': return 'border-l-green-400';
      default: return 'border-l-blue-400';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <span>Notifications</span>
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications([])}
              className="text-slate-400 hover:text-white"
            >
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 bg-slate-700/50 rounded-lg border-l-2 ${getBorderColor(notification.type)} relative group`}
            >
              <button
                onClick={() => removeNotification(notification.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-slate-400 hover:text-white" />
              </button>
              
              <div className="flex items-start space-x-3">
                {getIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-slate-300 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-400">
                    {notification.timestamp.toLocaleTimeString()}
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
