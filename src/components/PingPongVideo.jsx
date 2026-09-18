import React, { useRef, useEffect } from 'react';

export default function PingPongVideo({ src, className, overlayClassName }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    let animId = null;
    let frames = [];
    let isCaptured = false;
    let frameIdx = 0;
    let direction = 1; // 1 = Forward, -1 = Reverse
    let lastTime = 0;
    const targetFps = 30;
    const frameDuration = 1000 / targetFps;

    // Resize canvas to maintain crisp aspect ratio
    const updateCanvasSize = () => {
      if (canvas && canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width > 0 ? Math.min(rect.width, 1280) : 960;
        canvas.height = rect.height > 0 ? Math.min(rect.height, 720) : 540;
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Capture high-performance GPU bitmap frame
    const captureFrame = async () => {
      if (isCaptured || video.paused || video.ended) return;
      try {
        if ('createImageBitmap' in window) {
          const bitmap = await createImageBitmap(video, {
            resizeWidth: canvas.width,
            resizeHeight: canvas.height,
            resizeQuality: 'medium'
          });
          frames.push(bitmap);
        }
      } catch (e) {
        // Silent fallback
      }
    };

    const drawToCanvas = (drawable) => {
      if (!ctx || !drawable || canvas.width === 0 || canvas.height === 0) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(drawable, 0, 0, canvas.width, canvas.height);
    };

    const renderLoop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed >= frameDuration) {
        lastTime = timestamp - (elapsed % frameDuration);

        if (!isCaptured) {
          // Recording Phase: video plays naturally
          if (video && !video.paused) {
            drawToCanvas(video);
            captureFrame();
          }
        } else if (frames.length > 0) {
          // Playback Phase: 100% smooth Hardware-Accelerated Ping-Pong
          drawToCanvas(frames[frameIdx]);

          frameIdx += direction;

          if (frameIdx >= frames.length) {
            frameIdx = frames.length - 1;
            direction = -1; // Reverse direction
          } else if (frameIdx < 0) {
            frameIdx = 0;
            direction = 1; // Forward direction
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    const handleEnded = () => {
      if (!isCaptured && frames.length > 5) {
        isCaptured = true;
        video.pause();
        frameIdx = frames.length - 1;
        direction = -1;
      }
    };

    const handleTimeUpdate = () => {
      if (!isCaptured && video.duration && video.currentTime >= video.duration - 0.1) {
        handleEnded();
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    video.play().then(() => {
      animId = requestAnimationFrame(renderLoop);
    }).catch((err) => {
      console.warn('Autoplay error:', err);
      // Fallback loop start if autoplay policy requires user interaction
      animId = requestAnimationFrame(renderLoop);
    });

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animId) cancelAnimationFrame(animId);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      // Clean up GPU bitmaps
      frames.forEach((bmp) => {
        if (bmp && bmp.close) bmp.close();
      });
    };
  }, [src]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Hidden Video element used as decoding source */}
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        crossOrigin="anonymous"
        className="opacity-0 absolute pointer-events-none w-1 h-1"
      />
      {/* 60 FPS Hardware-Accelerated Ping-Pong Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover ${className || ''}`}
      />
      {overlayClassName && <div className={overlayClassName} />}
    </div>
  );
}
