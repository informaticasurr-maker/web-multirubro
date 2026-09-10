import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAppBackNavigationProps {
  activeStoryIndex: number | null;
  setActiveStoryIndex: (index: number | null) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isClientHistoryOpen: boolean;
  setIsClientHistoryOpen: (open: boolean) => void;
  isPlayerOpen: boolean;
  setIsPlayerOpen: (open: boolean) => void;
  bookingStep: number;
  setBookingStep: (step: number) => void;
}

export const useAppBackNavigation = ({
  activeStoryIndex,
  setActiveStoryIndex,
  isAdminOpen,
  setIsAdminOpen,
  isClientHistoryOpen,
  setIsClientHistoryOpen,
  isPlayerOpen,
  setIsPlayerOpen,
  bookingStep,
  setBookingStep
}: UseAppBackNavigationProps) => {
  const [showExitToast, setShowExitToast] = useState(false);

  // Latest state references for the popstate event listener
  const activeStoryIndexRef = useRef(activeStoryIndex);
  activeStoryIndexRef.current = activeStoryIndex;

  const isAdminOpenRef = useRef(isAdminOpen);
  isAdminOpenRef.current = isAdminOpen;

  const isClientHistoryOpenRef = useRef(isClientHistoryOpen);
  isClientHistoryOpenRef.current = isClientHistoryOpen;

  const isPlayerOpenRef = useRef(isPlayerOpen);
  isPlayerOpenRef.current = isPlayerOpen;

  const bookingStepRef = useRef(bookingStep);
  bookingStepRef.current = bookingStep;

  // Track previous states to know when an overlay opened or closed
  const prevStoryIndex = useRef<number | null>(activeStoryIndex);
  const prevAdminOpen = useRef(isAdminOpen);
  const prevClientHistoryOpen = useRef(isClientHistoryOpen);
  const prevPlayerOpen = useRef(isPlayerOpen);
  const prevBookingStep = useRef(bookingStep);

  // Flags to coordinate between browser popstate and UI programmatic back
  const isPopStateActionRef = useRef(false);
  const isUiBackRef = useRef(false);
  const lastExitAttemptRef = useRef<number>(0);
  const toastTimeoutRef = useRef<any>(null);

  // 1. Initialize base history state on mount and register popstate listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Push initial home state if not present so back button has something to pop
    if (!window.history.state || window.history.state.app !== 'barber_app') {
      window.history.replaceState({ app: 'barber_app', level: 'root' }, '');
      window.history.pushState({ app: 'barber_app', level: 'home' }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      // If triggered by UI close calling history.back(), ignore
      if (isUiBackRef.current) {
        isUiBackRef.current = false;
        return;
      }

      isPopStateActionRef.current = true;

      // Priority 1: If full-screen Story Viewer is open, close it (pantalla anterior)
      if (activeStoryIndexRef.current !== null) {
        setActiveStoryIndex(null);
        setTimeout(() => {
          isPopStateActionRef.current = false;
        }, 50);
        return;
      }

      // Priority 2: If Admin Modal is open, close it (pantalla anterior)
      if (isAdminOpenRef.current) {
        setIsAdminOpen(false);
        setTimeout(() => {
          isPopStateActionRef.current = false;
        }, 50);
        return;
      }

      // Priority 3: If Client History Modal is open, close it (pantalla anterior)
      if (isClientHistoryOpenRef.current) {
        setIsClientHistoryOpen(false);
        setTimeout(() => {
          isPopStateActionRef.current = false;
        }, 50);
        return;
      }

      // Priority 4: If Expanded Music Player is open, minimize it (pantalla anterior)
      if (isPlayerOpenRef.current) {
        setIsPlayerOpen(false);
        setTimeout(() => {
          isPopStateActionRef.current = false;
        }, 50);
        return;
      }

      // Priority 5: If inside booking flow (Step > 1), return to previous step (pantalla anterior)
      if (bookingStepRef.current > 1) {
        setBookingStep(bookingStepRef.current - 1);
        setTimeout(() => {
          isPopStateActionRef.current = false;
        }, 50);
        return;
      }

      isPopStateActionRef.current = false;

      // Priority 6: At home root screen (no overlays or booking steps open)
      // Prevent exiting to desktop on accidental back press
      const now = Date.now();
      if (now - lastExitAttemptRef.current < 2200) {
        // User confirmed exit by pressing back twice within 2.2s -> Allow exit to desktop
        window.history.back();
      } else {
        // First back press -> Keep user in app, re-seed home history, and show toast
        lastExitAttemptRef.current = now;
        window.history.pushState({ app: 'barber_app', level: 'home' }, '');
        setShowExitToast(true);

        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setShowExitToast(false);
        }, 2200);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [
    setActiveStoryIndex,
    setIsAdminOpen,
    setIsClientHistoryOpen,
    setIsPlayerOpen,
    setBookingStep
  ]);

  // 2. Automatically synchronize Story Viewer state with history
  useEffect(() => {
    if (activeStoryIndex !== null && prevStoryIndex.current === null) {
      // Opened
      window.history.pushState({ app: 'barber_app', overlay: 'story' }, '');
    } else if (activeStoryIndex === null && prevStoryIndex.current !== null) {
      // Closed via UI (not via popstate)
      if (!isPopStateActionRef.current && window.history.state?.overlay === 'story') {
        isUiBackRef.current = true;
        window.history.back();
      }
    }
    prevStoryIndex.current = activeStoryIndex;
  }, [activeStoryIndex]);

  // 3. Automatically synchronize Admin Modal state with history
  useEffect(() => {
    if (isAdminOpen && !prevAdminOpen.current) {
      // Opened
      window.history.pushState({ app: 'barber_app', overlay: 'admin' }, '');
    } else if (!isAdminOpen && prevAdminOpen.current) {
      // Closed via UI
      if (!isPopStateActionRef.current && window.history.state?.overlay === 'admin') {
        isUiBackRef.current = true;
        window.history.back();
      }
    }
    prevAdminOpen.current = isAdminOpen;
  }, [isAdminOpen]);

  // 4. Automatically synchronize Client History Modal state with history
  useEffect(() => {
    if (isClientHistoryOpen && !prevClientHistoryOpen.current) {
      // Opened
      window.history.pushState({ app: 'barber_app', overlay: 'client_history' }, '');
    } else if (!isClientHistoryOpen && prevClientHistoryOpen.current) {
      // Closed via UI
      if (!isPopStateActionRef.current && window.history.state?.overlay === 'client_history') {
        isUiBackRef.current = true;
        window.history.back();
      }
    }
    prevClientHistoryOpen.current = isClientHistoryOpen;
  }, [isClientHistoryOpen]);

  // 5. Automatically synchronize Expanded Music Player state with history
  useEffect(() => {
    if (isPlayerOpen && !prevPlayerOpen.current) {
      // Expanded
      window.history.pushState({ app: 'barber_app', overlay: 'music_player' }, '');
    } else if (!isPlayerOpen && prevPlayerOpen.current) {
      // Minimized via UI
      if (!isPopStateActionRef.current && window.history.state?.overlay === 'music_player') {
        isUiBackRef.current = true;
        window.history.back();
      }
    }
    prevPlayerOpen.current = isPlayerOpen;
  }, [isPlayerOpen]);

  // 6. Automatically synchronize Booking Step changes with history
  useEffect(() => {
    if (bookingStep > prevBookingStep.current) {
      // Forward step in booking: push history entry
      window.history.pushState({ app: 'barber_app', overlay: `booking_step_${bookingStep}` }, '');
    } else if (bookingStep < prevBookingStep.current) {
      // Backward step in booking via UI
      if (!isPopStateActionRef.current && window.history.state?.overlay?.startsWith('booking_step_')) {
        isUiBackRef.current = true;
        window.history.back();
      }
    }
    prevBookingStep.current = bookingStep;
  }, [bookingStep]);

  return {
    showExitToast
  };
};
