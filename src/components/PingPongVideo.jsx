import React, { useRef, useEffect } from 'react';

export default function PingPongVideo({ src, className, overlayClassName }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animFrameId = null;
    let lastTimestamp = null;
    let isReversing = false;

    const reverseStep = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (video) {
        if (video.currentTime > 0.08) {
          // Move backward smoothly at 1x speed
          video.currentTime = Math.max(0, video.currentTime - delta);
          animFrameId = requestAnimationFrame(reverseStep);
        } else {
          // Reached the beginning: switch to forward playback
          video.currentTime = 0;
          isReversing = false;
          lastTimestamp = null;
          video.play().catch(() => {});
        }
      }
    };

    const handleEnded = () => {
      if (isReversing) return;
      isReversing = true;
      lastTimestamp = null;
      video.pause();
      animFrameId = requestAnimationFrame(reverseStep);
    };

    const handleTimeUpdate = () => {
      if (!isReversing && video.duration && video.currentTime >= video.duration - 0.1) {
        handleEnded();
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Initial play trigger
    video.play().catch((err) => {
      console.warn('Autoplay deferred:', err);
    });

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [src]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        className={className}
      />
      {overlayClassName && <div className={overlayClassName} />}
    </div>
  );
}
