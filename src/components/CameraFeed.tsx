
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Play, Pause, RotateCcw, Maximize2, AlertCircle } from 'lucide-react';

interface CameraFeedProps {
  isConnected: boolean;
  piIp?: string;
}

export const CameraFeed = ({ isConnected, piIp }: CameraFeedProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [lastMotion, setLastMotion] = useState<Date | null>(null);
  const [streamError, setStreamError] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    if (piIp && isConnected) {
      const url = `http://${piIp}:8000/stream.mjpg`;
      setStreamUrl(url);
      setStreamError(false);
    } else {
      setStreamUrl(null);
    }
  }, [piIp, isConnected]);

  useEffect(() => {
    // Simulate motion detection for demo purposes
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of motion
        setLastMotion(new Date());
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleImageError = () => {
    setStreamError(true);
  };

  const handleImageLoad = () => {
    setStreamError(false);
  };

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
              disabled={!isConnected || !streamUrl || streamError}
            >
              {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="outline" disabled={!isConnected || !streamUrl}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" disabled={!isConnected || !streamUrl}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
          {streamUrl && isConnected && !streamError ? (
            <>
              <img 
                src={streamUrl} 
                alt="Pi Camera Feed"
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              
              {/* Motion detection indicator */}
              {lastMotion && (
                <div className="absolute top-4 right-4 bg-red-500/90 px-3 py-1 rounded-full text-xs font-medium">
                  Motion Detected
                </div>
              )}
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500/90 px-3 py-1 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>REC</span>
                </div>
              )}
              
              {/* Timestamp */}
              <div className="absolute bottom-4 left-4 bg-black/70 px-2 py-1 rounded text-xs text-white">
                {new Date().toLocaleString()}
              </div>
            </>
          ) : streamError ? (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <div className="text-center text-red-400">
                <AlertCircle className="h-16 w-16 mx-auto mb-2" />
                <p className="font-medium">Camera Stream Error</p>
                <p className="text-sm text-slate-500 mt-1">
                  Check Pi connection and camera setup
                </p>
              </div>
            </div>
          ) : !streamUrl ? (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No Pi Connected</p>
                <p className="text-sm text-slate-500 mt-1">
                  Configure your Pi in Device Manager
                </p>
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
