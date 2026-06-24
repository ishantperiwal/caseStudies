import React, { useState, useEffect } from 'react';
import assetsData from './assets_manifest.json';
import BentoCard from './BentoCard';
import DetailModal from './DetailModal';
import EditorModal from './EditorModal';

function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const [hasEditPermission, setHasEditPermission] = useState(false);

  // Sync URL parameters for edit/admin permission strictly on active URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('edit') === 'true' || params.get('admin') === 'true') {
      setHasEditPermission(true);
    } else {
      setHasEditPermission(false);
    }
  }, []);

  // Always enforce clean dark mode and remove light mode residues
  useEffect(() => {
    document.body.classList.remove('light-theme');
    localStorage.removeItem('payzapp_portfolio_theme');
  }, []);

  const [isScrolling, setIsScrolling] = useState(false);

  // Monitor scrolling state with a 200ms debounce
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Load initial manifest merged with localStorage overrides
  useEffect(() => {
    const saved = localStorage.getItem('payzapp_portfolio_overrides');
    const overrides = saved ? JSON.parse(saved) : {};
    const merged = assetsData.map((asset) => {
      if (overrides[asset.id]) {
        return { ...asset, ...overrides[asset.id] };
      }
      return asset;
    });
    setAssets(merged);
  }, []);

  // Update specific asset properties (live updates)
  const updateAsset = (id, newProps) => {
    setAssets((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...newProps } : a));
      
      // Save overrides to localStorage
      const saved = localStorage.getItem('payzapp_portfolio_overrides');
      const overrides = saved ? JSON.parse(saved) : {};
      overrides[id] = { ...overrides[id], ...newProps };
      localStorage.setItem('payzapp_portfolio_overrides', JSON.stringify(overrides));
      
      // Update editingAsset state live to keep modal preview synced
      if (editingAsset && editingAsset.id === id) {
        setEditingAsset((curr) => ({ ...curr, ...newProps }));
      }
      
      return updated;
    });
  };

  // Reset all layout settings back to default scan outputs
  const resetAllOverrides = () => {
    if (window.confirm('Are you sure you want to reset all background colors, sizes, and crop settings back to default?')) {
      localStorage.removeItem('payzapp_portfolio_overrides');
      setAssets(assetsData);
      if (editingAsset) setEditingAsset(null);
      if (selectedAsset) setSelectedAsset(null);
    }
  };

  // Handle click on card based on mode
  const handleCardClick = (asset) => {
    if (isEditMode) {
      setEditingAsset(asset);
    } else {
      setSelectedAsset(asset);
    }
  };

  // Copy manifest to clipboard
  const copyManifestToClipboard = () => {
    // Generate clean copy of assets without overrides state variables if needed
    // In our case, saving the full assets list as JSON is perfect
    navigator.clipboard.writeText(JSON.stringify(assets, null, 2))
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => console.error('Failed to copy text: ', err));
  };

  return (
    <main className="showcase-container">
      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="edit-mode-banner">
          <span>🛠️ <strong>Layout Editor Active:</strong> Click any card to customize size, background, padding, zoom, and crop offsets.</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsExportOpen(true)} className="banner-btn export-btn">
              Export Config
            </button>
            <button onClick={resetAllOverrides} className="banner-btn reset-btn">
              Reset Grid
            </button>
            <button onClick={() => setIsEditMode(false)} className="banner-btn done-btn">
              Done Editing
            </button>
          </div>
        </div>
      )}

      {/* Premium Header */}
      <header className="showcase-header">
        <h1>Motion Across PayZapp</h1>
        <p>
          A few of the many animations and micro-interactions I created during my time at Zeta.
        </p>
        {!isEditMode && hasEditPermission && (
          <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
            <button onClick={() => setIsEditMode(true)} className="edit-toggle-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
              </svg>
              Customize Grid
            </button>
          </div>
        )}
      </header>

      {/* Bento Grid */}
      <section className="bento-grid" aria-label="Animation Grid">
        {assets.map((asset) => (
          <BentoCard
            key={asset.id}
            asset={asset}
            isScrolling={isScrolling}
            onClick={handleCardClick}
          />
        ))}
      </section>

      {/* Full-screen Detail Viewer Modal */}
      {selectedAsset && !isEditMode && (
        <DetailModal
          key={selectedAsset.id}
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {/* Layout Editor Modal */}
      {editingAsset && isEditMode && (
        <EditorModal
          key={editingAsset.id}
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={updateAsset}
        />
      )}

      {/* Configuration Export Modal */}
      {isExportOpen && (
        <div className="modal-overlay" onClick={() => setIsExportOpen(false)}>
          <div className="modal-content-container" style={{ maxWidth: '700px', height: '65vh', flexDirection: 'column', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsExportOpen(false)} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-details-header" style={{ marginBottom: '20px' }}>
              <span className="category-badge">Export</span>
              <h2>Save Custom Manifest</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Copy the updated JSON structure below and paste it into <strong>src/assets_manifest.json</strong> inside your repository to make your custom grid sizes, background colors, and crop offsets permanent.
              </p>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '12px', background: '#07070a', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
              <textarea
                readOnly
                value={JSON.stringify(assets, null, 2)}
                style={{ flex: 1, background: 'transparent', border: 'none', resize: 'none', color: '#10b981', fontFamily: 'monospace', fontSize: '0.8rem', padding: '16px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                className="control-btn" 
                onClick={() => setIsExportOpen(false)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Close
              </button>
              <button 
                className="control-btn active" 
                onClick={copyManifestToClipboard}
                style={{ flex: 1.5, justifyContent: 'center' }}
              >
                {copySuccess ? 'Copied Successfully! ✔️' : 'Copy Config to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
