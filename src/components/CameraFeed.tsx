
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';

interface CameraFeedProps {
  isConnected: boolean;
}

export const CameraFeed = ({ isConnected }: CameraFeedProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [lastMotion, setLastMotion] = useState<Date | null>(null);

  useEffect(() => {
    // Simulate motion detection
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of motion
        setLastMotion(new Date());
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-teal-400" />
            <span>Live Camera Feed</span>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={isRecording ? "destructive" : "default"}
              onClick={() => setIsRecording(!isRecording)}
              disabled={!isConnected}
            >
              {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" disabled={!isConnected}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={!isConnected}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
          {isConnected ? (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              {/* Simulated camera feed */}
              <div className="text-center space-y-2">
                <div className="animate-pulse">
                  <Camera className="h-16 w-16 text-teal-400 mx-auto mb-2" />
                </div>
                <p className="text-slate-300">Pi Camera Module Active</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                  <span>{isRecording ? 'Recording' : 'Live'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p>Camera Offline</p>
              </div>
            </div>
          )}
          
          {/* Motion detection indicator */}
          {lastMotion && (
            <div className="absolute top-4 right-4 bg-red-500/90 px-3 py-1 rounded-full text-xs font-medium">
              Motion Detected
            </div>
          )}
          
          {/* Timestamp */}
          <div className="absolute bottom-4 left-4 bg-black/70 px-2 py-1 rounded text-xs text-white">
            {new Date().toLocaleString()}
          </div>
        </div>
        
        {lastMotion && (
          <div className="mt-3 text-sm text-slate-400">
            Last motion: {lastMotion.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
