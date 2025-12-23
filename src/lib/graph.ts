// Graph Data Structures and Algorithms

export interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'normal' | 'hospital' | 'fire_station' | 'police';
}

export interface Edge {
  from: string;
  to: string;
  weight: number;
  traffic: number; // 0-1, affects weight
  blocked: boolean;
}

export interface Graph {
  nodes: Map<string, Node>;
  edges: Map<string, Edge[]>;
}

// Priority Queue implementation using Min-Heap
export class PriorityQueue<T> {
  private heap: { priority: number; value: T }[] = [];

  enqueue(value: T, priority: number): void {
    this.heap.push({ priority, value });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return min.value;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }
      if (smallest === index) break;
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

// Dijkstra's Algorithm
export function dijkstra(
  graph: Graph,
  startId: string,
  endId: string,
  isEmergency: boolean = false
): { path: string[]; distance: number; visited: string[] } {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited: string[] = [];
  const pq = new PriorityQueue<string>();

  // Initialize distances
  graph.nodes.forEach((_, id) => {
    distances.set(id, id === startId ? 0 : Infinity);
    previous.set(id, null);
  });

  pq.enqueue(startId, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;

    if (visited.includes(current)) continue;
    visited.push(current);

    if (current === endId) break;

    const edges = graph.edges.get(current) || [];
    for (const edge of edges) {
      if (edge.blocked && !isEmergency) continue;

      const neighbor = edge.to;
      // Calculate effective weight considering traffic
      let effectiveWeight = edge.weight;
      if (!isEmergency) {
        effectiveWeight *= (1 + edge.traffic * 2); // Traffic increases weight
      }

      const distance = distances.get(current)! + effectiveWeight;

      if (distance < distances.get(neighbor)!) {
        distances.set(neighbor, distance);
        previous.set(neighbor, current);
        pq.enqueue(neighbor, distance);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) || null;
  }

  return {
    path: path[0] === startId ? path : [],
    distance: distances.get(endId) || Infinity,
    visited
  };
}

// A* Algorithm with heuristic
export function aStar(
  graph: Graph,
  startId: string,
  endId: string,
  isEmergency: boolean = false
): { path: string[]; distance: number; visited: string[] } {
  const startNode = graph.nodes.get(startId);
  const endNode = graph.nodes.get(endId);
  if (!startNode || !endNode) return { path: [], distance: Infinity, visited: [] };

  const heuristic = (nodeId: string): number => {
    const node = graph.nodes.get(nodeId);
    if (!node) return Infinity;
    // Euclidean distance as heuristic
    return Math.sqrt(Math.pow(node.x - endNode.x, 2) + Math.pow(node.y - endNode.y, 2));
  };

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited: string[] = [];
  const pq = new PriorityQueue<string>();

  graph.nodes.forEach((_, id) => {
    gScore.set(id, id === startId ? 0 : Infinity);
    fScore.set(id, id === startId ? heuristic(startId) : Infinity);
    previous.set(id, null);
  });

  pq.enqueue(startId, fScore.get(startId)!);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;

    if (visited.includes(current)) continue;
    visited.push(current);

    if (current === endId) break;

    const edges = graph.edges.get(current) || [];
    for (const edge of edges) {
      if (edge.blocked && !isEmergency) continue;

      const neighbor = edge.to;
      let effectiveWeight = edge.weight;
      if (!isEmergency) {
        effectiveWeight *= (1 + edge.traffic * 2);
      }

      const tentativeGScore = gScore.get(current)! + effectiveWeight;

      if (tentativeGScore < gScore.get(neighbor)!) {
        previous.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + heuristic(neighbor));
        pq.enqueue(neighbor, fScore.get(neighbor)!);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) || null;
  }

  return {
    path: path[0] === startId ? path : [],
    distance: gScore.get(endId) || Infinity,
    visited
  };
}

// Bellman-Ford Algorithm (handles negative weights, detects negative cycles)
export function bellmanFord(
  graph: Graph,
  startId: string,
  endId: string,
  isEmergency: boolean = false
): { path: string[]; distance: number; hasNegativeCycle: boolean } {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();

  // Initialize distances
  graph.nodes.forEach((_, id) => {
    distances.set(id, id === startId ? 0 : Infinity);
    previous.set(id, null);
  });

  // Get all edges
  const allEdges: { from: string; to: string; weight: number }[] = [];
  graph.edges.forEach((edges, from) => {
    edges.forEach(edge => {
      if (!edge.blocked || isEmergency) {
        let effectiveWeight = edge.weight;
        if (!isEmergency) {
          effectiveWeight *= (1 + edge.traffic * 2);
        }
        allEdges.push({ from, to: edge.to, weight: effectiveWeight });
      }
    });
  });

  // Relax edges |V| - 1 times
  const nodeCount = graph.nodes.size;
  for (let i = 0; i < nodeCount - 1; i++) {
    for (const edge of allEdges) {
      const newDist = distances.get(edge.from)! + edge.weight;
      if (newDist < distances.get(edge.to)!) {
        distances.set(edge.to, newDist);
        previous.set(edge.to, edge.from);
      }
    }
  }

  // Check for negative cycles
  let hasNegativeCycle = false;
  for (const edge of allEdges) {
    if (distances.get(edge.from)! + edge.weight < distances.get(edge.to)!) {
      hasNegativeCycle = true;
      break;
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) || null;
  }

  return {
    path: path[0] === startId ? path : [],
    distance: distances.get(endId) || Infinity,
    hasNegativeCycle
  };
}

// Generate a sample city graph
export function generateCityGraph(): Graph {
  const nodes = new Map<string, Node>();
  const edges = new Map<string, Edge[]>();

  // Create a grid-like city layout with some special locations
  const nodeData: Node[] = [
    { id: 'A', x: 100, y: 80, label: 'Downtown', type: 'normal' },
    { id: 'B', x: 250, y: 60, label: 'Market St', type: 'normal' },
    { id: 'C', x: 400, y: 80, label: 'Tech Park', type: 'normal' },
    { id: 'D', x: 550, y: 60, label: 'Airport Rd', type: 'normal' },
    { id: 'E', x: 80, y: 180, label: 'Hospital', type: 'hospital' },
    { id: 'F', x: 220, y: 160, label: 'City Hall', type: 'normal' },
    { id: 'G', x: 380, y: 180, label: 'University', type: 'normal' },
    { id: 'H', x: 540, y: 160, label: 'Mall', type: 'normal' },
    { id: 'I', x: 100, y: 280, label: 'Fire Station', type: 'fire_station' },
    { id: 'J', x: 250, y: 260, label: 'Stadium', type: 'normal' },
    { id: 'K', x: 400, y: 280, label: 'Police HQ', type: 'police' },
    { id: 'L', x: 550, y: 260, label: 'Industrial', type: 'normal' },
    { id: 'M', x: 80, y: 380, label: 'Suburbs W', type: 'normal' },
    { id: 'N', x: 220, y: 360, label: 'Park', type: 'normal' },
    { id: 'O', x: 380, y: 380, label: 'Station', type: 'normal' },
    { id: 'P', x: 540, y: 360, label: 'Suburbs E', type: 'normal' },
  ];

  nodeData.forEach(node => nodes.set(node.id, node));

  // Create bidirectional edges
  const edgeData: [string, string, number][] = [
    // Horizontal connections
    ['A', 'B', 15], ['B', 'C', 18], ['C', 'D', 20],
    ['E', 'F', 14], ['F', 'G', 16], ['G', 'H', 18],
    ['I', 'J', 15], ['J', 'K', 17], ['K', 'L', 19],
    ['M', 'N', 14], ['N', 'O', 16], ['O', 'P', 18],
    // Vertical connections
    ['A', 'E', 12], ['B', 'F', 11], ['C', 'G', 13], ['D', 'H', 12],
    ['E', 'I', 11], ['F', 'J', 12], ['G', 'K', 13], ['H', 'L', 11],
    ['I', 'M', 12], ['J', 'N', 11], ['K', 'O', 13], ['L', 'P', 12],
    // Diagonal shortcuts
    ['A', 'F', 18], ['B', 'G', 19], ['C', 'H', 20],
    ['E', 'J', 17], ['F', 'K', 18], ['G', 'L', 19],
    ['I', 'N', 16], ['J', 'O', 17], ['K', 'P', 18],
  ];

  edgeData.forEach(([from, to, weight]) => {
    // Add edge from -> to
    if (!edges.has(from)) edges.set(from, []);
    edges.get(from)!.push({ from, to, weight, traffic: Math.random() * 0.5, blocked: false });
    
    // Add edge to -> from (bidirectional)
    if (!edges.has(to)) edges.set(to, []);
    edges.get(to)!.push({ from: to, to: from, weight, traffic: Math.random() * 0.5, blocked: false });
  });

  return { nodes, edges };
}

export function getEdgeKey(from: string, to: string): string {
  return `${from}-${to}`;
}
