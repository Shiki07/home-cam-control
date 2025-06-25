
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Thermometer, Droplets, Sun, Wind } from 'lucide-react';

interface EnvironmentalControlsProps {
  isConnected: boolean;
}

export const EnvironmentalControls = ({ isConnected }: EnvironmentalControlsProps) => {
  const [temperature, setTemperature] = useState([22]);
  const [humidity] = useState(45);
  const [lightLevel, setLightLevel] = useState([75]);
  const [fanSpeed, setFanSpeed] = useState([2]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Temperature Control */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Thermometer className="h-5 w-5 text-red-400" />
            <span>Temperature</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{temperature[0]}°C</div>
            <div className="text-sm text-slate-400">Target Temperature</div>
          </div>
          <Slider
            value={temperature}
            onValueChange={setTemperature}
            max={30}
            min={15}
            step={1}
            disabled={!isConnected}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>15°C</span>
            <span>30°C</span>
          </div>
        </CardContent>
      </Card>

      {/* Humidity Monitor */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Droplets className="h-5 w-5 text-blue-400" />
            <span>Humidity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{humidity}%</div>
            <div className="text-sm text-slate-400">Current Humidity</div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${humidity}%` }}
            ></div>
          </div>
          <div className="text-xs text-center text-slate-400">
            Optimal: 40-60%
          </div>
        </CardContent>
      </Card>

      {/* Lighting Control */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Sun className="h-5 w-5 text-yellow-400" />
            <span>Lighting</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{lightLevel[0]}%</div>
            <div className="text-sm text-slate-400">Brightness</div>
          </div>
          <Slider
            value={lightLevel}
            onValueChange={setLightLevel}
            max={100}
            min={0}
            step={5}
            disabled={!isConnected}
            className="w-full"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            disabled={!isConnected}
            onClick={() => setLightLevel(lightLevel[0] > 0 ? [0] : [75])}
          >
            {lightLevel[0] > 0 ? 'Turn Off' : 'Turn On'}
          </Button>
        </CardContent>
      </Card>

      {/* Fan Control */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Wind className="h-5 w-5 text-teal-400" />
            <span>Ventilation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {fanSpeed[0] === 0 ? 'OFF' : `${fanSpeed[0]}`}
            </div>
            <div className="text-sm text-slate-400">Fan Speed</div>
          </div>
          <Slider
            value={fanSpeed}
            onValueChange={setFanSpeed}
            max={5}
            min={0}
            step={1}
            disabled={!isConnected}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Off</span>
            <span>Max</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
