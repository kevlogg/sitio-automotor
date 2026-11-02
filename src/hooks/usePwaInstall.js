import { useState, useEffect } from 'react';

// Helper to determine initial installation / standalone status synchronously
function getInitialInstalledState() {
  if (typeof window === 'undefined') return false;
  try {
    const isStandaloneMode =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
      window.matchMedia?.('(display-mode: minimal-ui)')?.matches ||
      window.matchMedia?.('(display-mode: window-controls-overlay)')?.matches ||
      window.navigator?.standalone === true ||
      (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://')) ||
      (typeof window !== 'undefined' && window.location?.search?.includes('source=pwa')) ||
      localStorage.getItem('pwa_installed') === 'true';

    return Boolean(isStandaloneMode);
  } catch (err) {
    return false;
  }
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(getInitialInstalledState);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check standalone modes and persistent storage
    const checkStatus = async () => {
      try {
        const isStandaloneMode =
          window.matchMedia?.('(display-mode: standalone)')?.matches ||
          window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
          window.matchMedia?.('(display-mode: minimal-ui)')?.matches ||
          window.matchMedia?.('(display-mode: window-controls-overlay)')?.matches ||
          window.navigator?.standalone === true ||
          (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://')) ||
          (typeof window !== 'undefined' && window.location?.search?.includes('source=pwa')) ||
          localStorage.getItem('pwa_installed') === 'true';

        if (isStandaloneMode) {
          setIsInstalled(true);
          try {
            localStorage.setItem('pwa_installed', 'true');
          } catch (e) {}
        }
      } catch (err) {}

      // Check native getInstalledRelatedApps API (Chromium / Android)
      if (typeof window.navigator !== 'undefined' && 'getInstalledRelatedApps' in window.navigator) {
        try {
          const relatedApps = await window.navigator.getInstalledRelatedApps();
          if (relatedApps && relatedApps.length > 0) {
            setIsInstalled(true);
            try {
              localStorage.setItem('pwa_installed', 'true');
            } catch (e) {}
          }
        } catch (err) {
          // Ignore if not supported or permission denied
        }
      }
    };

    checkStatus();

    // Listen for display-mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e) => {
      if (e.matches) {
        setIsInstalled(true);
        try {
          localStorage.setItem('pwa_installed', 'true');
        } catch (e) {}
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleMediaChange);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Chromium, Android, Edge, etc.)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      try {
        localStorage.setItem('pwa_installed', 'true');
      } catch (e) {}
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          try {
            localStorage.setItem('pwa_installed', 'true');
          } catch (e) {}
        }
        setDeferredPrompt(null);
        return { success: true, outcome: choice.outcome };
      } catch (err) {
        console.error('Error during prompt:', err);
        return { success: false, error: err };
      }
    }
    return { success: false, isIOS };
  };

  return {
    isInstallable,
    isInstalled,
    isIOS,
    promptInstall,
  };
}
