import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, GitBranch, Layers } from 'lucide-react';

interface AlgorithmVisualizerProps {
  algorithm: 'dijkstra' | 'astar' | 'bellmanford';
  currentStep: string;
  path: string[];
  visitedNodes: string[];
}

const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({
  algorithm,
  currentStep,
  path,
  visitedNodes
}) => {
  const algorithmDetails = {
    dijkstra: {
      name: "Dijkstra's Algorithm",
      complexity: 'O((V + E) log V)',
      description: 'Greedy algorithm that finds shortest path by always expanding the node with minimum distance.',
      steps: [
        'Initialize distances: source = 0, others = ∞',
        'Add source to priority queue',
        'Extract minimum, relax neighbors',
        'Repeat until destination reached'
      ]
    },
    astar: {
      name: 'A* Search Algorithm',
      complexity: 'O(E log V)',
      description: 'Uses heuristic (Euclidean distance) to guide search towards goal more efficiently.',
      steps: [
        'Initialize with f(n) = g(n) + h(n)',
        'Expand node with lowest f-score',
        'Update g-scores for neighbors',
        'Continue until goal reached'
      ]
    },
    bellmanford: {
      name: 'Bellman-Ford Algorithm',
      complexity: 'O(V × E)',
      description: 'Dynamic programming approach that can handle negative edge weights.',
      steps: [
        'Initialize distances: source = 0, others = ∞',
        'Relax all edges |V| - 1 times',
        'Check for negative cycles',
        'Return shortest paths'
      ]
    }
  };

  const details = algorithmDetails[algorithm];

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Code className="w-4 h-4 text-primary" />
          Algorithm Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Algorithm Name */}
        <div>
          <h3 className="text-lg font-semibold text-foreground">{details.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">Time Complexity:</span>
            <code className="text-xs bg-secondary px-2 py-0.5 rounded font-mono text-primary">
              {details.complexity}
            </code>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {details.description}
        </p>

        {/* Algorithm Steps */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Algorithm Steps</span>
          </div>
          <div className="space-y-1">
            {details.steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start gap-2 text-xs"
              >
                <span className="text-primary font-mono">{index + 1}.</span>
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Status */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Execution Status</span>
          </div>
          
          <div className="bg-secondary rounded-lg p-3 font-mono text-xs">
            <div className="text-muted-foreground mb-2">
              {currentStep || 'Awaiting input...'}
            </div>
            
            {path.length > 0 && (
              <div className="mt-2">
                <span className="text-primary">Path: </span>
                <span className="text-success">
                  {path.join(' → ')}
                </span>
              </div>
            )}
            
            {visitedNodes.length > 0 && (
              <div className="mt-1 text-warning">
                Explored: {visitedNodes.length} nodes
              </div>
            )}
          </div>
        </div>

        {/* Data Structures Used */}
        <div className="border-t border-border pt-4">
          <span className="text-xs font-semibold text-foreground block mb-2">
            Data Structures
          </span>
          <div className="flex flex-wrap gap-1">
            {algorithm === 'dijkstra' && (
              <>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Min-Heap</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Hash Map</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Adjacency List</span>
              </>
            )}
            {algorithm === 'astar' && (
              <>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Priority Queue</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Hash Map</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Heuristic Function</span>
              </>
            )}
            {algorithm === 'bellmanford' && (
              <>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Edge List</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Distance Array</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Predecessor Array</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlgorithmVisualizer;
