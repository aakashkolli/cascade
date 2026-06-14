import { useShallow } from 'zustand/shallow';
import { useTokenGraphStore } from './tokenGraphStore.ts';

export const useTokens = () => useTokenGraphStore(useShallow((s) => s.tokens));
export const useViolations = () => useTokenGraphStore(useShallow((s) => s.violations));
export const useResolvedValues = () => useTokenGraphStore(useShallow((s) => s.resolvedValues));
export const useCanUndo = () => useTokenGraphStore((s) => s.past.length > 0);
export const useCanRedo = () => useTokenGraphStore((s) => s.future.length > 0);
export const useViolationCount = () => useTokenGraphStore((s) => s.violations.size);
export const useReverseEdges = () => useTokenGraphStore(useShallow((s) => s.reverseEdges));
export const useStoreActions = () =>
  useTokenGraphStore(
    useShallow((s) => ({
      setTokenValue: s.setTokenValue,
      addToken: s.addToken,
      removeToken: s.removeToken,
      addEdge: s.addEdge,
      removeEdge: s.removeEdge,
      importSystem: s.importSystem,
      reset: s.reset,
      undo: s.undo,
      redo: s.redo,
      exportCSS: s.exportCSS,
      exportStyleDictionary: s.exportStyleDictionary,
      exportFigmaTokens: s.exportFigmaTokens,
      exportCSVData: s.exportCSVData,
    })),
  );
export const useEdges = () => useTokenGraphStore(useShallow((s) => s.edges));
export const useEdgeMeta = () => useTokenGraphStore(useShallow((s) => s.edgeMeta));
