import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  Navigation, 
  Zap,
  Route,
  Timer,
  MapPin
} from 'lucide-react';

interface ControlPanelProps {
  selectedStart: string | null;
  selectedEnd: string | null;
  algorithm: 'dijkstra' | 'astar' | 'bellmanford';
  onAlgorithmChange: (algo: 'dijkstra' | 'astar' | 'bellmanford') => void;
  onFindPath: () => void;
  onReset: () => void;
  onSimulateTraffic: () => void;
  onTriggerEmergency: () => void;
  pathDistance: number;
  isAnimating: boolean;
  visitedCount: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedStart,
  selectedEnd,
  algorithm,
  onAlgorithmChange,
  onFindPath,
  onReset,
  onSimulateTraffic,
  onTriggerEmergency,
  pathDistance,
  isAnimating,
  visitedCount
}) => {
  const algorithms = [
    { id: 'dijkstra', name: 'Dijkstra', description: 'Guaranteed shortest path' },
    { id: 'astar', name: 'A*', description: 'Heuristic-based, faster' },
    { id: 'bellmanford', name: 'Bellman-Ford', description: 'Handles negative weights' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Selection Status */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Route Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Start:</span>
            {selectedStart ? (
              <Badge variant="outline" className="bg-node-start/20 text-node-start border-node-start/50">
                Node {selectedStart}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">Click a node</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">End:</span>
            {selectedEnd ? (
              <Badge variant="outline" className="bg-node-end/20 text-node-end border-node-end/50">
                Node {selectedEnd}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-xs">Click another node</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Selection */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {algorithms.map((algo) => (
            <Button
              key={algo.id}
              variant={algorithm === algo.id ? 'default' : 'control'}
              size="sm"
              className="w-full justify-start"
              onClick={() => onAlgorithmChange(algo.id)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{algo.name}</span>
                <span className="text-xs opacity-70">{algo.description}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="glow"
            size="sm"
            className="w-full"
            onClick={onFindPath}
            disabled={!selectedStart || !selectedEnd || isAnimating}
          >
            <Play className="w-4 h-4" />
            Find Optimal Route
          </Button>
          
          <Button
            variant="warning"
            size="sm"
            className="w-full"
            onClick={onSimulateTraffic}
            disabled={isAnimating}
          >
            <Zap className="w-4 h-4" />
            Simulate Traffic
          </Button>
          
          <Button
            variant="emergency"
            size="sm"
            className="w-full"
            onClick={onTriggerEmergency}
            disabled={isAnimating}
          >
            <AlertTriangle className="w-4 h-4" />
            Emergency Response
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4" />
            Reset Map
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Distance:</span>
            <Badge variant="outline" className="font-mono">
              {pathDistance === Infinity ? '—' : `${pathDistance.toFixed(1)} units`}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Nodes Explored:</span>
            <Badge variant="outline" className="font-mono">
              {visitedCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Status:</span>
            <Badge 
              variant="outline" 
              className={isAnimating ? 'bg-warning/20 text-warning border-warning/50' : 'bg-success/20 text-success border-success/50'}
            >
              {isAnimating ? 'Computing...' : 'Ready'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Click nodes to select start/end points</p>
            <p>• Click edges to block/unblock roads</p>
            <p>• Emergency vehicles ignore traffic & blocks</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlPanel;
