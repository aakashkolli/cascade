import { describe, it, expect } from 'vitest';
import { makeCommandHistory, createSetValueCommand, createAddTokenCommand, createRemoveTokenCommand } from '../../src/engine/commands.ts';
import { makeTokenSystemState } from '../../src/engine/types.ts';
import { propagate } from '../../src/engine/propagate.ts';
import type { Token } from '../../src/engine/types.ts';

function hexToken(id: string, hex: string): Token {
  return { id, name: id, group: 'color', value: { type: 'hex', value: hex }, tags: [] };
}

function stateWithToken(id: string, hex: string) {
  const state = makeTokenSystemState();
  state.tokens.set(id, hexToken(id, hex));
  state.edges.set(id, []);
  state.reverseEdges.set(id, []);
  propagate(state, id);
  return state;
}

describe('CommandHistory', () => {
  it('applies a command and updates state', () => {
    const state = stateWithToken('a', '#000000');
    const history = makeCommandHistory();
    const cmd = createSetValueCommand('a', { type: 'hex', value: '#FF0000' }, state);
    history.apply(cmd, state);
    expect(state.resolvedValues.get('a')?.hex).toBe('#FF0000');
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
  });

  it('undoes the last command', () => {
    const state = stateWithToken('a', '#000000');
    const history = makeCommandHistory();
    history.apply(createSetValueCommand('a', { type: 'hex', value: '#FF0000' }, state), state);
    history.undo(state);
    expect(state.resolvedValues.get('a')?.hex).toBe('#000000');
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
  });

  it('redoes after undo', () => {
    const state = stateWithToken('a', '#000000');
    const history = makeCommandHistory();
    history.apply(createSetValueCommand('a', { type: 'hex', value: '#FF0000' }, state), state);
    history.undo(state);
    history.redo(state);
    expect(state.resolvedValues.get('a')?.hex).toBe('#FF0000');
  });

  it('clears redo stack when new command applied after undo', () => {
    const state = stateWithToken('a', '#000000');
    const history = makeCommandHistory();
    history.apply(createSetValueCommand('a', { type: 'hex', value: '#FF0000' }, state), state);
    history.undo(state);
    history.apply(createSetValueCommand('a', { type: 'hex', value: '#00FF00' }, state), state);
    expect(history.canRedo()).toBe(false);
  });

  it('N undos then N redos returns to original state', () => {
    const state = stateWithToken('a', '#000000');
    const history = makeCommandHistory();
    const edits = ['#111111', '#222222', '#333333', '#444444', '#555555'];
    for (const hex of edits) {
      history.apply(createSetValueCommand('a', { type: 'hex', value: hex }, state), state);
    }
    for (let i = 0; i < edits.length; i++) history.undo(state);
    expect(state.resolvedValues.get('a')?.hex).toBe('#000000');
    for (let i = 0; i < edits.length; i++) history.redo(state);
    expect(state.resolvedValues.get('a')?.hex).toBe('#555555');
  });

  it('undo on empty history is a no-op', () => {
    const state = stateWithToken('a', '#000000');
    const history = makeCommandHistory();
    expect(() => { history.undo(state); }).not.toThrow();
  });

  it('redo on empty future is a no-op', () => {
    const state = stateWithToken('a', '#000000');
    const history = makeCommandHistory();
    expect(() => { history.redo(state); }).not.toThrow();
  });
});

describe('createAddTokenCommand', () => {
  it('adds a token to the state', () => {
    const state = makeTokenSystemState();
    const history = makeCommandHistory();
    const cmd = createAddTokenCommand(hexToken('new', '#ABCDEF'));
    history.apply(cmd, state);
    expect(state.tokens.has('new')).toBe(true);
    expect(state.resolvedValues.get('new')?.hex).toBe('#ABCDEF');
  });

  it('undoes token addition', () => {
    const state = makeTokenSystemState();
    const history = makeCommandHistory();
    history.apply(createAddTokenCommand(hexToken('new', '#ABCDEF')), state);
    history.undo(state);
    expect(state.tokens.has('new')).toBe(false);
    expect(state.resolvedValues.has('new')).toBe(false);
  });
});

describe('createRemoveTokenCommand', () => {
  it('removes a token from the state', () => {
    const state = stateWithToken('a', '#FF0000');
    const history = makeCommandHistory();
    history.apply(createRemoveTokenCommand('a', state), state);
    expect(state.tokens.has('a')).toBe(false);
  });

  it('undoes token removal', () => {
    const state = stateWithToken('a', '#FF0000');
    const history = makeCommandHistory();
    history.apply(createRemoveTokenCommand('a', state), state);
    history.undo(state);
    expect(state.tokens.has('a')).toBe(true);
    expect(state.resolvedValues.get('a')?.hex).toBe('#FF0000');
  });
});
