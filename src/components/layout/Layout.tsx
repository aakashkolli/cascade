import { useState, useRef } from 'react';
import type { TokenId } from '../../engine/types';
import styles from './layout.module.css';
import { Header } from './Header';
import { TokensView } from '../tokens/TokensView';
import { ImportPanel } from '../import/ImportPanel';
import { GraphView } from '../graph/GraphView.tsx';
import { TokenDetailPanel } from '../tokens/TokenDetailPanel.tsx';
import { AuditView } from '../audit/AuditView.tsx';

type View = 'tokens' | 'graph' | 'audit';

interface LayoutProps {
  onImportClick: () => void;
  importOpen: boolean;
  onImportClose: () => void;
}

export function Layout({ onImportClick, importOpen, onImportClose }: LayoutProps) {
  const [currentView, setCurrentView] = useState<View>('tokens');
  const [selectedId, setSelectedId] = useState<TokenId | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function handleSelect(id: TokenId, el: HTMLElement) {
    triggerRef.current = el;
    setSelectedId(id);
  }

  function handleClose() {
    setSelectedId(null);
    triggerRef.current?.focus();
  }

  function handleGraphSelect(id: TokenId | null) {
    setSelectedId(id);
  }

  return (
    <div className={styles.root}>
      <Header
        onImportClick={onImportClick}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      <main className={styles.main}>
        <h1 className="sr-only">Cascade Design Token Editor</h1>
        {currentView === 'tokens' && (
          <TokensView
            selectedId={selectedId}
            onSelect={handleSelect}
            onClose={handleClose}
            onImportClick={onImportClick}
          />
        )}
        {currentView === 'graph' && (
          <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <GraphView selectedId={selectedId} onSelectToken={handleGraphSelect} />
            </div>
            {selectedId !== null && (
              <TokenDetailPanel tokenId={selectedId} onClose={handleClose} />
            )}
          </div>
        )}
        {currentView === 'audit' && <AuditView />}
      </main>
      {importOpen && <ImportPanel onClose={onImportClose} />}
    </div>
  );
}
