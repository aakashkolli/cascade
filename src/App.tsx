import { useState } from 'react';
import { TokenSystemProvider } from './TokenSystemProvider';
import { LiveRegions } from './components/shared/LiveRegions';
import { Layout } from './components/layout/Layout';

export function App() {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <TokenSystemProvider>
      <LiveRegions />
      <Layout
        onImportClick={() => setImportOpen(true)}
        importOpen={importOpen}
        onImportClose={() => setImportOpen(false)}
      />
    </TokenSystemProvider>
  );
}
