import type { Command, Token, TokenId, TokenSystemState, TokenValue } from './types.ts';
import { propagate } from './propagate.ts';

// ─── Command history ──────────────────────────────────────────────────────────

export interface CommandHistory {
  apply(cmd: Command, state: TokenSystemState): void;
  undo(state: TokenSystemState): void;
  redo(state: TokenSystemState): void;
  canUndo(): boolean;
  canRedo(): boolean;
  readonly past: readonly Command[];
  readonly future: readonly Command[];
}

export function makeCommandHistory(): CommandHistory {
  let past: Command[] = [];
  let future: Command[] = [];

  return {
    get past() { return past; },
    get future() { return future; },
    canUndo() { return past.length > 0; },
    canRedo() { return future.length > 0; },
    apply(cmd, state) {
      cmd.execute(state);
      past = [...past, cmd];
      future = [];
    },
    undo(state) {
      if (past.length === 0) return;
      const cmd = past[past.length - 1];
      cmd.undo(state);
      past = past.slice(0, -1);
      future = [cmd, ...future];
    },
    redo(state) {
      if (future.length === 0) return;
      const cmd = future[0];
      cmd.execute(state);
      future = future.slice(1);
      past = [...past, cmd];
    },
  };
}

// ─── Command factories ────────────────────────────────────────────────────────

let _cmdSeq = 0;
function nextId(): string { return `cmd-${(++_cmdSeq).toString()}`; }

export function createSetValueCommand(
  tokenId: TokenId,
  newValue: TokenValue,
  state: TokenSystemState
): Command {
  const token = state.tokens.get(tokenId);
  if (!token) throw new Error(`Token ${tokenId} does not exist`);
  const oldValue = token.value;

  return {
    id: nextId(),
    description: `Set ${tokenId} to ${JSON.stringify(newValue)}`,
    execute(s) {
      const t = s.tokens.get(tokenId);
      if (!t) return;
      s.tokens.set(tokenId, { ...t, value: newValue });
      propagate(s, tokenId);
    },
    undo(s) {
      const t = s.tokens.get(tokenId);
      if (!t) return;
      s.tokens.set(tokenId, { ...t, value: oldValue });
      propagate(s, tokenId);
    },
  };
}

export function createAddTokenCommand(token: Token): Command {
  return {
    id: nextId(),
    description: `Add token ${token.id}`,
    execute(s) {
      s.tokens.set(token.id, token);
      s.edges.set(token.id, []);
      s.reverseEdges.set(token.id, []);
      propagate(s, token.id);
    },
    undo(s) {
      s.tokens.delete(token.id);
      s.edges.delete(token.id);
      s.reverseEdges.delete(token.id);
      s.resolvedValues.delete(token.id);
    },
  };
}

export function createRemoveTokenCommand(
  tokenId: TokenId,
  state: TokenSystemState
): Command {
  const savedToken = state.tokens.get(tokenId);
  const savedEdges = [...(state.edges.get(tokenId) ?? [])];
  const savedReverseEdges = [...(state.reverseEdges.get(tokenId) ?? [])];
  const savedResolved = state.resolvedValues.get(tokenId);

  return {
    id: nextId(),
    description: `Remove token ${tokenId}`,
    execute(s) {
      // Remove forward references from outgoing neighbors
      for (const to of s.edges.get(tokenId) ?? []) {
        const rev = s.reverseEdges.get(to) ?? [];
        s.reverseEdges.set(to, rev.filter((f) => f !== tokenId));
        s.edgeMeta.delete(`${tokenId}→${to}`);
      }
      // Remove reverse references from incoming neighbors
      for (const from of s.reverseEdges.get(tokenId) ?? []) {
        const fwd = s.edges.get(from) ?? [];
        s.edges.set(from, fwd.filter((t) => t !== tokenId));
        s.edgeMeta.delete(`${from}→${tokenId}`);
      }
      s.tokens.delete(tokenId);
      s.edges.delete(tokenId);
      s.reverseEdges.delete(tokenId);
      s.resolvedValues.delete(tokenId);
      // Re-propagate from parents to update downstream
      for (const from of savedReverseEdges) {
        if (s.tokens.has(from)) propagate(s, from);
      }
    },
    undo(s) {
      if (!savedToken) return;
      s.tokens.set(tokenId, savedToken);
      s.edges.set(tokenId, [...savedEdges]);
      s.reverseEdges.set(tokenId, [...savedReverseEdges]);
      // Restore edge references in neighbors
      for (const to of savedEdges) {
        const rev = s.reverseEdges.get(to) ?? [];
        if (!rev.includes(tokenId)) s.reverseEdges.set(to, [...rev, tokenId]);
      }
      for (const from of savedReverseEdges) {
        const fwd = s.edges.get(from) ?? [];
        if (!fwd.includes(tokenId)) s.edges.set(from, [...fwd, tokenId]);
      }
      if (savedResolved) s.resolvedValues.set(tokenId, savedResolved);
      propagate(s, tokenId);
    },
  };
}
