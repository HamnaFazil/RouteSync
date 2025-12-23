import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import CityMap from '@/components/CityMap';
import ControlPanel from '@/components/ControlPanel';
import StatusBar from '@/components/StatusBar';
import AlgorithmVisualizer from '@/components/AlgorithmVisualizer';
import EventLog, { LogEntry } from '@/components/EventLog';
import { 
  Graph, 
  generateCityGraph, 
  dijkstra, 
  aStar, 
  bellmanFord 
} from '@/lib/graph';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const [graph, setGraph] = useState<Graph>(() => generateCityGraph());
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'astar' | 'bellmanford'>('dijkstra');
  const [path, setPath] = useState<string[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [pathDistance, setPathDistance] = useState<number>(Infinity);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [emergencyVehicle, setEmergencyVehicle] = useState<{ position: string; path: string[] } | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  }, []);

  // Count blocked roads
  const blockedRoads = Array.from(graph.edges.values())
    .flat()
    .filter(e => e.blocked).length / 2; // Divide by 2 since edges are bidirectional

  const handleNodeClick = useCallback((nodeId: string) => {
    if (!selectedStart) {
      setSelectedStart(nodeId);
      addLog('info', `Start node selected: ${nodeId}`);
      toast.info(`Start: Node ${nodeId}`);
    } else if (!selectedEnd && nodeId !== selectedStart) {
      setSelectedEnd(nodeId);
      addLog('info', `End node selected: ${nodeId}`);
      toast.info(`End: Node ${nodeId}`);
    } else {
      // Reset and start new selection
      setSelectedStart(nodeId);
      setSelectedEnd(null);
      setPath([]);
      setVisitedNodes([]);
      setPathDistance(Infinity);
      addLog('info', `New start node selected: ${nodeId}`);
    }
  }, [selectedStart, selectedEnd, addLog]);

  const handleEdgeClick = useCallback((from: string, to: string) => {
    setGraph(prevGraph => {
      const newEdges = new Map(prevGraph.edges);
      
      // Toggle blocked status for both directions
      const fromEdges = [...(newEdges.get(from) || [])];
      const toEdges = [...(newEdges.get(to) || [])];
      
      const fromEdge = fromEdges.find(e => e.to === to);
      const toEdge = toEdges.find(e => e.to === from);
      
      if (fromEdge) {
        fromEdge.blocked = !fromEdge.blocked;
        const status = fromEdge.blocked ? 'blocked' : 'cleared';
        addLog(fromEdge.blocked ? 'warning' : 'success', `Road ${from}↔${to} ${status}`);
        toast[fromEdge.blocked ? 'warning' : 'success'](`Road ${from}↔${to} ${status}`);
      }
      if (toEdge) {
        toEdge.blocked = !toEdge.blocked;
      }
      
      newEdges.set(from, fromEdges);
      newEdges.set(to, toEdges);
      
      return { ...prevGraph, edges: newEdges };
    });
  }, [addLog]);

  const animatePath = useCallback(async (pathToAnimate: string[], visited: string[]) => {
    setIsAnimating(true);
    setVisitedNodes([]);
    setPath([]);

    // Animate visited nodes
    for (let i = 0; i < visited.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setVisitedNodes(prev => [...prev, visited[i]]);
      setCurrentStep(`Exploring node ${visited[i]}...`);
    }

    // Animate path
    await new Promise(resolve => setTimeout(resolve, 200));
    for (let i = 0; i < pathToAnimate.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setPath(prev => [...prev, pathToAnimate[i]]);
      setCurrentStep(`Building path: ${pathToAnimate.slice(0, i + 1).join(' → ')}`);
    }

    setCurrentStep('Path found!');
    setIsAnimating(false);
  }, []);

  const handleFindPath = useCallback(() => {
    if (!selectedStart || !selectedEnd) return;

    addLog('info', `Finding path: ${selectedStart} → ${selectedEnd} using ${algorithm}`);
    setCurrentStep(`Running ${algorithm.toUpperCase()} algorithm...`);

    let result;
    switch (algorithm) {
      case 'astar':
        result = aStar(graph, selectedStart, selectedEnd, false);
        break;
      case 'bellmanford':
        const bfResult = bellmanFord(graph, selectedStart, selectedEnd, false);
        result = { ...bfResult, visited: [] }; // Bellman-Ford doesn't track visited nodes the same way
        if (bfResult.hasNegativeCycle) {
          addLog('error', 'Negative cycle detected!');
          toast.error('Negative cycle detected in graph');
          return;
        }
        break;
      default:
        result = dijkstra(graph, selectedStart, selectedEnd, false);
    }

    if (result.path.length === 0) {
      addLog('error', 'No path found - roads may be blocked');
      toast.error('No path found! Try unblocking some roads.');
      setCurrentStep('No path available');
      return;
    }

    setPathDistance(result.distance);
    addLog('success', `Path found: ${result.path.join(' → ')} (${result.distance.toFixed(1)} units)`);
    animatePath(result.path, result.visited);
  }, [selectedStart, selectedEnd, algorithm, graph, animatePath, addLog]);

  const handleReset = useCallback(() => {
    setGraph(generateCityGraph());
    setSelectedStart(null);
    setSelectedEnd(null);
    setPath([]);
    setVisitedNodes([]);
    setPathDistance(Infinity);
    setCurrentStep('');
    setEmergencyVehicle(null);
    addLog('info', 'System reset - map regenerated');
    toast.info('Map reset');
  }, [addLog]);

  const handleSimulateTraffic = useCallback(() => {
    setGraph(prevGraph => {
      const newEdges = new Map(prevGraph.edges);
      
      newEdges.forEach((edges, key) => {
        edges.forEach(edge => {
          edge.traffic = Math.random();
        });
      });
      
      return { ...prevGraph, edges: newEdges };
    });
    
    addLog('warning', 'Traffic conditions updated');
    toast.info('Traffic simulation updated');
  }, [addLog]);

  const handleTriggerEmergency = useCallback(async () => {
    // Find hospital and a random destination
    const hospital = Array.from(graph.nodes.values()).find(n => n.type === 'hospital');
    const destinations = Array.from(graph.nodes.values()).filter(n => n.type === 'normal');
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    
    if (!hospital || !destination) return;

    addLog('emergency', `🚨 EMERGENCY: Ambulance dispatched from ${hospital.label} to ${destination.label}`);
    toast.error('🚨 Emergency Response Activated!');

    // Find path ignoring traffic and blocks
    const result = dijkstra(graph, hospital.id, destination.id, true);
    
    if (result.path.length === 0) {
      addLog('error', 'Emergency: No route available!');
      return;
    }

    // Animate emergency vehicle
    setEmergencyVehicle({ position: hospital.id, path: result.path });
    
    for (let i = 0; i < result.path.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setEmergencyVehicle({ position: result.path[i], path: result.path });
      addLog('info', `Ambulance at ${result.path[i]}`);
    }
    
    addLog('success', `Emergency vehicle arrived at ${destination.label}`);
    toast.success('Emergency vehicle arrived!');
    
    setTimeout(() => {
      setEmergencyVehicle(null);
    }, 2000);
  }, [graph, addLog]);

  // Initial log
  useEffect(() => {
    addLog('success', 'SmartRoute AI System initialized');
    addLog('info', `Loaded ${graph.nodes.size} nodes and ${Array.from(graph.edges.values()).flat().length / 2} edges`);
  }, []);

  return (
    <>
      <Helmet>
        <title>SmartRoute AI - Emergency Response & Route Optimization System</title>
        <meta name="description" content="Advanced route optimization system using Dijkstra, A*, and Bellman-Ford algorithms. Real-time traffic simulation and emergency vehicle routing." />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        {/* Status Bar */}
        <StatusBar
          nodeCount={graph.nodes.size}
          edgeCount={Array.from(graph.edges.values()).flat().length / 2}
          blockedRoads={blockedRoads}
          emergencyActive={emergencyVehicle !== null}
        />
        
        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full">
            {/* Left Panel - Control */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <ControlPanel
                selectedStart={selectedStart}
                selectedEnd={selectedEnd}
                algorithm={algorithm}
                onAlgorithmChange={setAlgorithm}
                onFindPath={handleFindPath}
                onReset={handleReset}
                onSimulateTraffic={handleSimulateTraffic}
                onTriggerEmergency={handleTriggerEmergency}
                pathDistance={pathDistance}
                isAnimating={isAnimating}
                visitedCount={visitedNodes.length}
              />
            </div>
            
            {/* Center - Map */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="h-[400px] lg:h-[500px]">
                <CityMap
                  graph={graph}
                  path={path}
                  visitedNodes={visitedNodes}
                  selectedStart={selectedStart}
                  selectedEnd={selectedEnd}
                  emergencyVehicle={emergencyVehicle}
                  onNodeClick={handleNodeClick}
                  onEdgeClick={handleEdgeClick}
                  isAnimating={isAnimating}
                />
              </div>
              
              {/* Event Log below map */}
              <div className="mt-4">
                <EventLog logs={logs} />
              </div>
            </div>
            
            {/* Right Panel - Algorithm Details */}
            <div className="lg:col-span-3 order-3">
              <AlgorithmVisualizer
                algorithm={algorithm}
                currentStep={currentStep}
                path={path}
                visitedNodes={visitedNodes}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
