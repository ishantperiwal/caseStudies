import React, { useState, useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import assetsData from './assets_manifest.json';

const BACKGROUND_PRESETS = [
  { name: 'Default', value: 'rgba(15, 15, 23, 0.6)' },
  { name: 'Deep Blue', value: 'linear-gradient(135deg, #1e1e38 0%, #111124 100%)' },
  { name: 'Teal Depth', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { name: 'Crimson', value: 'linear-gradient(135deg, #2d0606 0%, #110202 100%)' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #062b1b 0%, #02120b 100%)' },
  { name: 'Amber', value: 'linear-gradient(135deg, #2d2206 0%, #110d02 100%)' },
  { name: 'Obsidian', value: 'linear-gradient(135deg, #1d1d1d 0%, #151515 100%)' },
];

const EditorModal = ({ asset, onClose, onSave }) => {
  const { path, name, type, category } = asset;
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Form State
  const [size, setSize] = useState(asset.size || 'square');
  const [backdrop, setBackdrop] = useState(asset.backdrop || BACKGROUND_PRESETS[0].value);
  const [customColor, setCustomColor] = useState(backdrop.startsWith('#') ? backdrop : '#0f0f17');
  const [padding, setPadding] = useState(asset.padding || 'default');
  const [zoom, setZoom] = useState(asset.zoom || 1);
  const [offsetX, setOffsetX] = useState(asset.offsetX || 0);
  const [offsetY, setOffsetY] = useState(asset.offsetY || 0);
  const [origin, setOrigin] = useState(asset.origin || 'center');
  const [showCropGuide, setShowCropGuide] = useState(true);
  const [borderRadius, setBorderRadius] = useState(asset.borderRadius || 0);
  const [nameText, setNameText] = useState(asset.name || '');
  
  const animRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load Lottie animation inside modal preview
  useEffect(() => {
    if (type !== 'lottie' || !containerRef.current) return;

    let isCancelled = false;
    fetch(path)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled || !containerRef.current) return;
        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: data,
        });
      })
      .catch((err) => console.error("Error loading Lottie inside editor preview:", err));

    return () => {
      isCancelled = true;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [type, path]);

  // Handle color change (presets vs custom)
  const handlePresetColor = (val) => {
    setBackdrop(val);
    onSave(asset.id, { backdrop: val });
    if (val.startsWith('#')) {
      setCustomColor(val);
    } else if (val.startsWith('rgba(15, 15, 23')) {
      setCustomColor('#0f0f17'); // default slate hex fallback for color picker
    }
  };

  const handleCustomColorChange = (e) => {
    const val = e.target.value;
    setCustomColor(val);
    setBackdrop(val);
    onSave(asset.id, { backdrop: val });
  };

  const handleTextInputChange = (val) => {
    let cleanVal = val;
    // Auto-prepend hash if it's a raw hex code typing
    if (val.length > 0 && !val.startsWith('#') && !val.startsWith('linear-gradient') && !val.startsWith('rgba')) {
      cleanVal = '#' + val;
    }
    setCustomColor(cleanVal);
    
    // Validate if it is a valid hex color, rgba or linear-gradient string
    if (/^#[0-9A-F]{6}$/i.test(cleanVal) || /^#[0-9A-F]{3}$/i.test(cleanVal) || cleanVal.startsWith('linear-gradient') || cleanVal.startsWith('rgba')) {
      setBackdrop(cleanVal);
      onSave(asset.id, { backdrop: cleanVal });
    }
  };

  // Dispatch live changes back to app state so the bento updates immediately
  const handleSizeChange = (val) => {
    setSize(val);
    onSave(asset.id, { size: val });
  };

  const handlePaddingToggle = (val) => {
    setPadding(val);
    onSave(asset.id, { padding: val });
  };

  const handleZoomChange = (val) => {
    setZoom(val);
    onSave(asset.id, { zoom: val });
  };

  const handleOffsetChange = (x, y) => {
    setOffsetX(x);
    setOffsetY(y);
    onSave(asset.id, { offsetX: x, offsetY: y });
  };

  const handleOriginChange = (val) => {
    setOrigin(val);
    onSave(asset.id, { origin: val });
  };

  const resetCardSettings = () => {
    const originalAsset = assetsData.find(a => a.id === asset.id);
    const originalName = originalAsset ? originalAsset.name : (asset.name || '');
    setNameText(originalName);
    setSize('square');
    setBackdrop(BACKGROUND_PRESETS[0].value);
    setPadding('default');
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setOrigin('center');
    setBorderRadius(0);
    onSave(asset.id, {
      name: originalName,
      size: 'square',
      backdrop: BACKGROUND_PRESETS[0].value,
      padding: 'default',
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      origin: 'center',
      borderRadius: 0,
    });
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this animation?\n\nFile: public/${path}\n\nIt will be moved to the "public/.deleted" folder and ignored from the showcase.`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/delete-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetPath: path }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('Asset successfully moved to public/.deleted/ folder!');
        window.location.reload();
      } else {
        alert(`Error: ${data.error || 'Failed to delete file'}`);
      }
    } catch (err) {
      alert(`Error connecting to server: ${err.message}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-container" style={{ maxWidth: '1100px' }} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Left Pane: LIVE CRIPPED CARD PREVIEW */}
        <div className="modal-viewer-pane">
          <div className="preview-asset-path-badge" title="File location in repository">
            <span>File: public/{path}</span>
            <button 
              className="badge-delete-btn" 
              onClick={handleDeleteClick}
              title="Delete asset (move to public/.deleted/)"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '8px',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#f87171';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          <div 
            className={`preview-card-frame ${size} ${showCropGuide ? 'crop-guide-active' : ''}`}
            style={{ background: backdrop }}
          >
            <div 
              className="modal-viewer-media"
              style={{
                width: `${(padding === 'none' ? 100 : 85) * zoom}%`,
                height: `${(padding === 'none' ? 100 : 85) * zoom}%`,
                transform: `translate(${offsetX}%, ${offsetY}%)`,
                borderRadius: `${borderRadius || 0}px`,
                transition: 'transform 0.1s ease, width 0.3s ease, height 0.3s ease',
                overflow: 'hidden',
              }}
            >
              {type === 'lottie' && (
                <div ref={containerRef} className="lottie-player-container" />
              )}
              
              {type === 'video' && (
                <video
                  ref={videoRef}
                  src={path}
                  loop
                  muted
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
              
              {type === 'gif' && (
                <img src={path} alt={name} style={{ objectFit: 'contain' }} />
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: EDITOR CONTROLS */}
        <div className="modal-details-pane" style={{ overflowY: 'auto' }}>
          <div className="modal-details-header">
            <span className="category-badge">Editor Mode</span>
            <h2>Configure Card</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{name}</p>
          </div>

          <div className="modal-controls" style={{ margin: '20px 0' }}>
            {/* Animation Title / Name */}
            <div className="control-group">
              <span className="control-label">Animation Name</span>
              <div className="control-action-row">
                <input
                  type="text"
                  value={nameText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNameText(val);
                    onSave(asset.id, { name: val });
                  }}
                  placeholder="Enter custom name..."
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    width: '100%',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Box Size */}
            <div className="control-group">
              <span className="control-label">Bento Size</span>
              <div className="control-action-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'square', label: 'Square (1x1)' },
                  { id: 'wide', label: 'Wide (2x1)' },
                  { id: 'tall', label: 'Tall (1x2)' },
                  { id: 'large', label: 'Large (2x2)' },
                  { id: 'tall-large', label: 'Tall Large (2x3)' },
                  { id: 'extra-wide', label: 'Extra Wide (3x2)' },
                  { id: 'extra-tall', label: 'Extra Tall (1x3)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    className={`control-btn ${size === s.id ? 'active' : ''}`}
                    onClick={() => handleSizeChange(s.id)}
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop Guide Toggle */}
            <div className="control-group">
              <span className="control-label">Editor View Mode</span>
              <div className="control-action-row">
                <button
                  className={`control-btn ${showCropGuide ? 'active' : ''}`}
                  onClick={() => setShowCropGuide(!showCropGuide)}
                  style={{ flex: 1, justifyContent: 'center', padding: '8px 16px' }}
                >
                  {showCropGuide ? 'Hide Crop Guide (Mask Overflow)' : 'Show Crop Guide (Show Bleed)'}
                </button>
              </div>
            </div>

            {/* Background Theme */}
            <div className="control-group">
              <span className="control-label">Background Color</span>
              <div className="color-presets" style={{ marginBottom: '8px' }}>
                {BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    className={`color-preset-dot ${backdrop === preset.value ? 'active' : ''}`}
                    style={{ background: preset.value }}
                    onClick={() => handlePresetColor(preset.value)}
                    title={preset.name}
                  />
                ))}
              </div>
              <div className="control-action-row" style={{ gap: '10px' }}>
                <input
                  type="color"
                  value={backdrop.startsWith('#') && backdrop.length === 7 ? backdrop : (customColor.startsWith('#') && customColor.length === 7 ? customColor : '#0f0f17')}
                  onChange={handleCustomColorChange}
                  style={{ width: '32px', height: '32px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
                  title="Choose solid color visually"
                />
                <input
                  type="text"
                  value={backdrop}
                  onChange={(e) => handleTextInputChange(e.target.value)}
                  placeholder="#000000 or linear-gradient(...)"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '8px', flex: 1, fontSize: '0.9rem' }}
                />
              </div>
            </div>

            {/* Padding Toggle */}
            <div className="control-group">
              <span className="control-label">Layout Fit</span>
              <div className="control-action-row" style={{ gap: '8px' }}>
                <button
                  className={`control-btn ${padding === 'default' ? 'active' : ''}`}
                  onClick={() => handlePaddingToggle('default')}
                  style={{ padding: '8px 16px', flex: 1 }}
                >
                  With Padding
                </button>
                <button
                  className={`control-btn ${padding === 'none' ? 'active' : ''}`}
                  onClick={() => handlePaddingToggle('none')}
                  style={{ padding: '8px 16px', flex: 1 }}
                >
                  Flush (No Padding)
                </button>
              </div>
            </div>

            {/* Zoom / Scale */}
            <div className="control-group">
              <div className="control-action-row" style={{ justifyContent: 'space-between' }}>
                <span className="control-label">Scale / Zoom</span>
                <span className="speed-value">{zoom.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="speed-slider"
              />
            </div>

            {/* Crop Offset X & Y */}
            <div className="control-group">
              <div className="control-action-row" style={{ justifyContent: 'space-between' }}>
                <span className="control-label">Offset X</span>
                <span className="speed-value">{offsetX}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="2"
                value={offsetX}
                onChange={(e) => handleOffsetChange(parseInt(e.target.value), offsetY)}
                className="speed-slider"
              />
            </div>

            <div className="control-group">
              <div className="control-action-row" style={{ justifyContent: 'space-between' }}>
                <span className="control-label">Offset Y</span>
                <span className="speed-value">{offsetY}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                step="2"
                value={offsetY}
                onChange={(e) => handleOffsetChange(offsetX, parseInt(e.target.value))}
                className="speed-slider"
              />
            </div>

            {/* Crop Transform Origin */}
            <div className="control-group">
              <span className="control-label">Scale Origin / Anchor</span>
              <div className="control-action-row" style={{ flexWrap: 'wrap', gap: '6px' }}>
                {['center', 'top', 'bottom', 'left', 'right'].map((o) => (
                  <button
                    key={o}
                    className={`control-btn ${origin === o ? 'active' : ''}`}
                    onClick={() => handleOriginChange(o)}
                    style={{ textTransform: 'capitalize', padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius Slider */}
            <div className="control-group">
              <div className="control-action-row" style={{ justifyContent: 'space-between' }}>
                <span className="control-label">Media Corner Radius (Mask)</span>
                <span className="speed-value">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="2"
                value={borderRadius}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setBorderRadius(val);
                  onSave(asset.id, { borderRadius: val });
                }}
                className="speed-slider"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
            <button 
              className="control-btn" 
              onClick={resetCardSettings} 
              style={{ flex: 1, justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}
            >
              Reset Card Defaults
            </button>
            <button 
              className="control-btn active" 
              onClick={onClose} 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Done editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;
