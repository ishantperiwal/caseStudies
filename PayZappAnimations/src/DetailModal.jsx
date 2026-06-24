import React, { useState, useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const BACKGROUND_PRESETS = [
  { name: 'Default', value: 'rgba(15, 15, 23, 0.4)' },
  { name: 'Navy', value: 'linear-gradient(135deg, #1e1e38 0%, #111124 100%)' },
  { name: 'Teal', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { name: 'Crimson', value: 'linear-gradient(135deg, #2d0606 0%, #110202 100%)' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #062b1b 0%, #02120b 100%)' },
  { name: 'Amber', value: 'linear-gradient(135deg, #2d2206 0%, #110d02 100%)' },
  { name: 'Obsidian', value: 'linear-gradient(135deg, #1d1d1d 0%, #151515 100%)' },
];

const DetailModal = ({ asset, onClose }) => {
  const { path, name, type, category, backdrop } = asset;
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [currentBackdrop, setCurrentBackdrop] = useState(backdrop || BACKGROUND_PRESETS[0].value);
  const animRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load Lottie animation inside modal
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

        // Sync initial speed
        animRef.current.setSpeed(speed);
      })
      .catch((err) => console.error("Error loading Lottie inside detail viewer:", err));

    return () => {
      isCancelled = true;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [type, path]);

  // Sync Play/Pause
  const togglePlay = () => {
    if (type === 'lottie' && animRef.current) {
      if (isPlaying) {
        animRef.current.pause();
      } else {
        animRef.current.play();
      }
    } else if (type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => console.log(err));
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Sync Speed
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (type === 'lottie' && animRef.current) {
      animRef.current.setSpeed(newSpeed);
    } else if (type === 'video' && videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const getCleanCategory = (cat) => {
    if (cat === 'general') return 'PayZapp';
    return cat.replace(/[_-]/g, ' ');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-container" style={{ maxWidth: '750px', height: '65vh', maxHeight: '600px' }} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Animation Viewer (Full width) */}
        <div className="modal-viewer-pane" style={{ flex: 1 }}>
          <div
            className="modal-viewer-backdrop"
            style={{ background: currentBackdrop }}
          />
          <div className="modal-viewer-media" style={{ width: '85%', height: '85%' }}>
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
                style={{ width: '100%', height: '100%' }}
              />
            )}
            
            {type === 'gif' && (
              <img src={path} alt={name} style={{ objectFit: 'contain' }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
