import type { TokenId } from '../../engine/types.ts';

/** A node in the rendered graph — positioned by the layout worker. */
export interface GraphNode {
  id: TokenId;
  label: string;
}

/** A directed dependency link between two nodes. */
export interface GraphLink {
  source: TokenId;
  target: TokenId;
}

/** Node visual status derived from violation state. */
export type NodeStatus = 'fail' | 'warn' | 'pass' | 'none';

/** Filter state for the graph controls. */
export interface FilterState {
  showBase: boolean;
  showSemantic: boolean;
  showComponent: boolean;
  violationsOnly: boolean;
}

/** Default filter — show everything. */
export const DEFAULT_FILTER: FilterState = {
  showBase: true,
  showSemantic: true,
  showComponent: true,
  violationsOnly: false,
};

/** Token category used for filtering. */
export type TokenCategory = 'base' | 'semantic' | 'component';

/** Message sent from the main thread to the layout worker. */
export interface WorkerInMessage {
  nodes: { id: TokenId }[];
  links: { source: TokenId; target: TokenId }[];
  width: number;
  height: number;
}

/** Message received from the layout worker. */
export type WorkerOutMessage =
  | { type: 'tick'; positions: { id: TokenId; x: number; y: number }[] }
  | { type: 'done'; positions: { id: TokenId; x: number; y: number }[] };

/** Node position as returned by the worker. */
export interface NodePosition {
  x: number;
  y: number;
}

/** Canvas colours for node status — hardcoded because canvas can't read CSS vars. */
export const NODE_STROKE: Record<NodeStatus, string> = {
  fail: '#B91C1C',
  warn: '#92400E',
  pass: '#065F46',
  none: '#6B7280',
};

export const NODE_FILL: Record<NodeStatus, string> = {
  fail: '#FEF2F2',
  warn: '#FFFBEB',
  pass: '#ECFDF5',
  none: '#F9FAFB',
};

export const NODE_RADIUS = 22;
export const LABEL_FONT = '11px system-ui, sans-serif';
