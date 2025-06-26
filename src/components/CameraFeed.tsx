
import { useState, useEffect, useRef } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    console.log('CameraFeed: Pi IP changed:', piIp, 'Connected:', isConnected);
    
    if (piIp && isConnected) {
      const url = `http://${piIp}:8000/stream.mjpg`;
      console.log('CameraFeed: Setting stream URL to:', url);
      setStreamUrl(url);
      setStreamError(false);
      setIsLoading(true);
      setConnectionAttempts(0);
    } else {
      console.log('CameraFeed: Clearing stream URL');
      setStreamUrl(null);
      setIsLoading(false);
      setConnectionAttempts(0);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
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
    console.error('CameraFeed: MJPEG stream error');
    setStreamError(true);
    setIsLoading(false);
    
    // Auto-retry logic with exponential backoff
    if (connectionAttempts < 3 && streamUrl) {
      const delay = Math.pow(2, connectionAttempts) * 2000; // 2s, 4s, 8s
      console.log(`CameraFeed: Retrying in ${delay}ms (attempt ${connectionAttempts + 1})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        setConnectionAttempts(prev => prev + 1);
        setStreamError(false);
        setIsLoading(true);
        
        // Force reload the image with cache-busting
        if (imgRef.current && streamUrl) {
          imgRef.current.src = streamUrl + '?t=' + Date.now();
        }
      }, delay);
    }
  };

  const handleImageLoad = () => {
    console.log('CameraFeed: MJPEG stream loaded successfully');
    setStreamError(false);
    setIsLoading(false);
    setConnectionAttempts(0);
  };

  const testStreamConnection = async () => {
    if (!piIp) return;
    
    try {
      console.log('CameraFeed: Testing connection to Pi health endpoint');
      setIsLoading(true);
      setStreamError(false);
      setConnectionAttempts(0);
      
      // Test the health endpoint first with proper CORS handling
      const response = await fetch(`http://${piIp}:8000/health`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        signal: AbortSignal.timeout(10000)
      });
      
      if (response.ok) {
        const healthData = await response.json();
        console.log('CameraFeed: Health check successful:', healthData);
        
        // Now try to reload the stream
        if (imgRef.current && streamUrl) {
          imgRef.current.src = streamUrl + '?t=' + Date.now();
        }
      } else {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } catch (error) {
      console.error('CameraFeed: Connection test failed:', error);
      setStreamError(true);
      setIsLoading(false);
    }
  };

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-teal-400" />
            <span>Live Camera Feed</span>
            {isLoading && (
              <div className="text-sm text-yellow-400">Connecting...</div>
            )}
            {connectionAttempts > 0 && !isLoading && (
              <div className="text-sm text-orange-400">Retry {connectionAttempts}/3</div>
            )}
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
            <Button 
              size="sm" 
              variant="outline" 
              disabled={!isConnected || !piIp || isLoading}
              onClick={testStreamConnection}
            >
              <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" variant="outline" disabled={!isConnected || !streamUrl}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
          {streamUrl && isConnected ? (
            <>
              <img 
                ref={imgRef}
                src={streamUrl}
                alt="Pi Camera Feed"
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{ display: streamError ? 'none' : 'block' }}
                crossOrigin="anonymous"
              />
              
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-2"></div>
                    <p className="text-sm">
                      {connectionAttempts > 0 ? `Retrying connection... (${connectionAttempts}/3)` : 'Connecting to camera...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Motion detection indicator */}
              {lastMotion && !streamError && (
                <div className="absolute top-4 right-4 bg-red-500/90 px-3 py-1 rounded-full text-xs font-medium">
                  Motion Detected
                </div>
              )}
              
              {/* Recording indicator */}
              {isRecording && !streamError && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500/90 px-3 py-1 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span>REC</span>
                </div>
              )}
              
              {/* Timestamp */}
              {!streamError && (
                <div className="absolute bottom-4 left-4 bg-black/70 px-2 py-1 rounded text-xs text-white">
                  {new Date().toLocaleString()}
                </div>
              )}
            </>
          ) : null}
          
          {/* Error State */}
          {streamError && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <div className="text-center text-red-400">
                <AlertCircle className="h-16 w-16 mx-auto mb-2" />
                <p className="font-medium">Camera Stream Error</p>
                <p className="text-sm text-slate-500 mt-1">
                  Cannot connect to: {streamUrl}
                </p>
                <p className="text-sm text-slate-500">
                  Check Pi camera service and network
                </p>
                <div className="mt-3 space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={testStreamConnection}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <div className="text-xs text-slate-600">
                    Attempts: {connectionAttempts}/3
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* No Pi Connected */}
          {!streamUrl && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Camera className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No Pi Connected</p>
                <p className="text-sm text-slate-500 mt-1">
                  Configure your Pi in Device Manager
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Debug information */}
        {streamUrl && (
          <div className="mt-2 text-xs text-slate-500">
            Stream: {streamUrl} | Attempts: {connectionAttempts}
          </div>
        )}
        
        {lastMotion && (
          <div className="mt-3 text-sm text-slate-400">
            Last motion: {lastMotion.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
