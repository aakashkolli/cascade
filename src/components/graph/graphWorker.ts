import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force';
import type { WorkerInMessage, WorkerOutMessage } from './types.ts';

type NodeDatum = { id: string; x: number; y: number; vx: number; vy: number };
type LinkDatum = { source: string; target: string };

self.addEventListener('message', (e: MessageEvent<WorkerInMessage>) => {
  const { nodes, links, width, height } = e.data;

  if (nodes.length === 0) {
    const msg: WorkerOutMessage = { type: 'done', positions: [] };
    self.postMessage(msg);
    return;
  }

  const nodeData: NodeDatum[] = nodes.map(n => ({
    id: n.id,
    x: width / 2 + (Math.random() - 0.5) * 100,
    y: height / 2 + (Math.random() - 0.5) * 100,
    vx: 0,
    vy: 0,
  }));

  const sim = forceSimulation(nodeData)
    .force(
      'link',
      forceLink<NodeDatum, LinkDatum>(links as LinkDatum[])
        .id((d) => d.id)
        .distance(120)
        .strength(0.8),
    )
    .force('charge', forceManyBody<NodeDatum>().strength(-400))
    .force('center', forceCenter<NodeDatum>(width / 2, height / 2))
    .force('collide', forceCollide<NodeDatum>(50))
    .stop();

  const TOTAL_TICKS = 300;
  const BATCH = 50;
  let done = 0;

  const sendPositions = (type: WorkerOutMessage['type']) => {
    const positions = nodeData.map(n => ({ id: n.id, x: n.x, y: n.y }));
    const msg: WorkerOutMessage = { type, positions };
    self.postMessage(msg);
  };

  const runBatch = () => {
    const end = Math.min(done + BATCH, TOTAL_TICKS);
    for (; done < end; done++) sim.tick(1);
    if (done >= TOTAL_TICKS) {
      sendPositions('done');
    } else {
      sendPositions('tick');
      setTimeout(runBatch, 0);
    }
  };

  runBatch();
});
