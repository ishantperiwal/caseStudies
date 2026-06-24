import React, { useState, useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const BentoCard = ({ asset, isScrolling, onClick }) => {
  const { path, name, type, category, backdrop, size } = asset;
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const animRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visibleRatio = entry.intersectionRatio;
        const cardHeight = entry.boundingClientRect.height;
        const viewportHeight = window.innerHeight;
        
        // If 10% visible, start fetching/loading JSON in the background
        if (visibleRatio >= 0.1 && !hasEnteredView) {
          setHasEnteredView(true);
        }
        
        // Only mark in view for playback if mostly visible (70%+)
        // Scale threshold down if card is taller than screen height
        const requiredRatio = cardHeight > viewportHeight ? (viewportHeight / cardHeight) * 0.70 : 0.70;
        setIsInView(visibleRatio >= requiredRatio);
      },
      {
        rootMargin: '0px',
        threshold: [0.1, 0.70],
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [hasEnteredView]);

  // Handle Lottie animation lifecycle
  useEffect(() => {
    if (type !== 'lottie' || !hasEnteredView || !containerRef.current) return;

    let isCancelled = false;
    fetch(path)
      .then((res) => res.json())
      .then((data) => {
        if (isCancelled || !containerRef.current) return;
        animRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: isInView, // Play immediately if currently in view
          animationData: data,
        });

        animRef.current.addEventListener('DOMLoaded', () => {
          setIsLoaded(true);
        });
      })
      .catch((err) => console.error("Error loading Lottie animation data:", err));

    return () => {
      isCancelled = true;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [type, path, hasEnteredView]);

  // Play/Pause control based on intersection state, scrolling, and load status
  useEffect(() => {
    // Keep playing/paused state frozen while actively scrolling
    if (isScrolling) return;

    if (type === 'lottie' && animRef.current) {
      if (isInView) {
        animRef.current.play();
      } else {
        animRef.current.pause();
      }
    } else if (type === 'video' && videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch((err) => {
          // Auto-play might be blocked or interrupted
          console.log("Video play interrupted:", err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, type, isLoaded, isScrolling]);

  // Format category name for badges
  const getCleanCategory = (cat) => {
    if (cat === 'general') return 'PayZapp';
    return cat.replace(/[_-]/g, ' ');
  };

  return (
    <div
      ref={cardRef}
      className={`bento-card ${size}`}
      onClick={() => onClick(asset)}
    >
      {/* Background with dynamic/fallback color */}
      <div
        className="card-backdrop-overlay"
        style={{ background: backdrop || 'var(--bg-card)' }}
      />

      {/* Hover arrow indicator */}
      <div className="hover-indicator">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>

      {/* Media Content */}
      <div className="card-content-wrapper">
        {!hasEnteredView && (
          <div className="card-placeholder">
            <div className="loader-spinner"></div>
          </div>
        )}

        <div 
          className="card-media"
          style={{
            width: `${(asset.padding === 'none' ? 100 : 85) * (asset.zoom || 1)}%`,
            height: `${(asset.padding === 'none' ? 100 : 85) * (asset.zoom || 1)}%`,
            transform: `translate(${asset.offsetX || 0}%, ${asset.offsetY || 0}%)`,
            borderRadius: `${asset.borderRadius || 0}px`,
            overflow: 'hidden',
            transition: 'transform 0.2s ease, width 0.3s ease, height 0.3s ease',
          }}
        >
          {hasEnteredView && (
            <>
              {type === 'lottie' && (
                <div
                  ref={containerRef}
                  className="lottie-player-container"
                  style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                />
              )}

              {type === 'video' && (
                <video
                  ref={videoRef}
                  src={path}
                  loop
                  muted
                  playsInline
                  onLoadedData={() => setIsLoaded(true)}
                  style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease', width: '100%', height: '100%' }}
                />
              )}

              {type === 'gif' && (
                <img
                  src={path}
                  alt={name}
                  onLoad={() => setIsLoaded(true)}
                  style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s ease', width: '100%', height: '100%' }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Metadata showing on hover */}
      <div className="card-meta">
        <span className="card-title">{name}</span>
      </div>
    </div>
  );
};

export default BentoCard;
