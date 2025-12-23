import React, { useCallback } from 'react';
import { Graph, Node, Edge } from '@/lib/graph';

interface CityMapProps {
  graph: Graph;
  path: string[];
  visitedNodes: string[];
  selectedStart: string | null;
  selectedEnd: string | null;
  emergencyVehicle: { position: string; path: string[] } | null;
  onNodeClick: (nodeId: string) => void;
  onEdgeClick: (from: string, to: string) => void;
  isAnimating: boolean;
}

const CityMap: React.FC<CityMapProps> = ({
  graph,
  path,
  visitedNodes,
  selectedStart,
  selectedEnd,
  emergencyVehicle,
  onNodeClick,
  onEdgeClick,
  isAnimating
}) => {
  const getNodeColor = useCallback((node: Node): string => {
    if (node.id === selectedStart) return 'hsl(var(--node-start))';
    if (node.id === selectedEnd) return 'hsl(var(--node-end))';
    if (emergencyVehicle?.position === node.id) return 'hsl(var(--emergency))';
    if (path.includes(node.id)) return 'hsl(var(--primary))';
    if (visitedNodes.includes(node.id)) return 'hsl(var(--warning))';
    
    switch (node.type) {
      case 'hospital': return 'hsl(var(--destructive))';
      case 'fire_station': return 'hsl(var(--warning))';
      case 'police': return 'hsl(var(--primary))';
      default: return 'hsl(var(--muted-foreground))';
    }
  }, [selectedStart, selectedEnd, path, visitedNodes, emergencyVehicle]);

  const getNodeIcon = useCallback((node: Node): string => {
    switch (node.type) {
      case 'hospital': return '🏥';
      case 'fire_station': return '🚒';
      case 'police': return '🚔';
      default: return '';
    }
  }, []);

  const getEdgeColor = useCallback((edge: Edge, from: string, to: string): string => {
    if (edge.blocked) return 'hsl(var(--node-blocked))';
    
    // Check if this edge is part of the path
    const pathIndex = path.indexOf(from);
    if (pathIndex !== -1 && path[pathIndex + 1] === to) {
      return 'hsl(var(--primary))';
    }
    
    // Check if emergency vehicle is on this edge
    if (emergencyVehicle) {
      const evPathIndex = emergencyVehicle.path.indexOf(from);
      if (evPathIndex !== -1 && emergencyVehicle.path[evPathIndex + 1] === to) {
        return 'hsl(var(--emergency))';
      }
    }
    
    // Traffic-based coloring
    if (edge.traffic > 0.7) return 'hsl(var(--traffic-high))';
    if (edge.traffic > 0.4) return 'hsl(var(--traffic-medium))';
    return 'hsl(var(--traffic-low))';
  }, [path, emergencyVehicle]);

  const getEdgeWidth = useCallback((edge: Edge, from: string, to: string): number => {
    const pathIndex = path.indexOf(from);
    if (pathIndex !== -1 && path[pathIndex + 1] === to) return 4;
    if (edge.blocked) return 2;
    return 2;
  }, [path]);

  const renderEdges = () => {
    const renderedEdges: React.ReactNode[] = [];
    const renderedPairs = new Set<string>();

    graph.edges.forEach((edges, from) => {
      const fromNode = graph.nodes.get(from);
      if (!fromNode) return;

      edges.forEach((edge, index) => {
        const toNode = graph.nodes.get(edge.to);
        if (!toNode) return;

        // Avoid rendering duplicate edges
        const pairKey = [from, edge.to].sort().join('-');
        if (renderedPairs.has(pairKey)) return;
        renderedPairs.add(pairKey);

        const color = getEdgeColor(edge, from, edge.to);
        const width = getEdgeWidth(edge, from, edge.to);
        const isInPath = path.indexOf(from) !== -1 && path[path.indexOf(from) + 1] === edge.to;
        
        renderedEdges.push(
          <g key={`edge-${from}-${edge.to}-${index}`}>
            {/* Glow effect for path edges */}
            {isInPath && (
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={color}
                strokeWidth={width + 6}
                strokeOpacity={0.3}
                strokeLinecap="round"
              />
            )}
            {/* Main edge line */}
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={color}
              strokeWidth={width}
              strokeLinecap="round"
              strokeDasharray={edge.blocked ? '5,5' : isInPath && isAnimating ? '10,5' : 'none'}
              className={isInPath && isAnimating ? 'animate-route-flow' : ''}
              style={{ cursor: 'pointer' }}
              onClick={() => onEdgeClick(from, edge.to)}
            />
            {/* Traffic indicator */}
            {!edge.blocked && (
              <circle
                cx={(fromNode.x + toNode.x) / 2}
                cy={(fromNode.y + toNode.y) / 2}
                r={4}
                fill={color}
                opacity={0.8}
              />
            )}
            {/* Blocked indicator */}
            {edge.blocked && (
              <text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm"
                fill="hsl(var(--destructive))"
              >
                ✕
              </text>
            )}
          </g>
        );
      });
    });

    return renderedEdges;
  };

  const renderNodes = () => {
    const nodes: React.ReactNode[] = [];

    graph.nodes.forEach((node) => {
      const color = getNodeColor(node);
      const icon = getNodeIcon(node);
      const isSpecial = node.type !== 'normal';
      const isSelected = node.id === selectedStart || node.id === selectedEnd;
      const isInPath = path.includes(node.id);
      const hasEmergency = emergencyVehicle?.position === node.id;

      nodes.push(
        <g
          key={`node-${node.id}`}
          style={{ cursor: 'pointer' }}
          onClick={() => onNodeClick(node.id)}
        >
          {/* Outer glow for selected/path nodes */}
          {(isSelected || isInPath || hasEmergency) && (
            <circle
              cx={node.x}
              cy={node.y}
              r={isSelected ? 24 : 20}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={0.4}
              className={hasEmergency ? 'animate-node-pulse' : ''}
            />
          )}
          {/* Node circle */}
          <circle
            cx={node.x}
            cy={node.y}
            r={isSpecial ? 16 : 12}
            fill="hsl(var(--card))"
            stroke={color}
            strokeWidth={3}
          />
          {/* Icon for special nodes */}
          {isSpecial && (
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs"
            >
              {icon}
            </text>
          )}
          {/* Node ID for normal nodes */}
          {!isSpecial && (
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              className="text-xs font-bold font-mono"
            >
              {node.id}
            </text>
          )}
          {/* Label */}
          <text
            x={node.x}
            y={node.y + 28}
            textAnchor="middle"
            fill="hsl(var(--foreground))"
            className="text-[10px] font-medium"
            opacity={0.8}
          >
            {node.label}
          </text>
        </g>
      );
    });

    return nodes;
  };

  return (
    <div className="relative w-full h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline opacity-30" />
      
      <svg
        viewBox="0 0 640 460"
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        {/* Render edges first (behind nodes) */}
        <g className="edges">{renderEdges()}</g>
        
        {/* Render nodes on top */}
        <g className="nodes">{renderNodes()}</g>
        
        {/* Emergency vehicle indicator */}
        {emergencyVehicle && (
          <g className="emergency-vehicle">
            {(() => {
              const pos = graph.nodes.get(emergencyVehicle.position);
              if (!pos) return null;
              return (
                <>
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={30}
                    fill="none"
                    stroke="hsl(var(--emergency))"
                    strokeWidth={2}
                    className="animate-node-pulse"
                    opacity={0.6}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 35}
                    textAnchor="middle"
                    fill="hsl(var(--emergency))"
                    className="text-lg font-bold text-glow-emergency"
                  >
                    🚑
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
        <div className="font-semibold mb-2 text-foreground">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-start" />
            <span className="text-muted-foreground">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-end" />
            <span className="text-muted-foreground">End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-traffic-low" />
            <span className="text-muted-foreground">Low Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-traffic-high" />
            <span className="text-muted-foreground">High Traffic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-node-blocked" />
            <span className="text-muted-foreground">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityMap;
