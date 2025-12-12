import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface BackendHealthContextType {
  isBackendReady: boolean;
  isChecking: boolean;
  retryCount: number;
  estimatedWaitTime: number;
  error: string | null;
  checkHealth: () => Promise<boolean>;
}

const BackendHealthContext = createContext<BackendHealthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const HEALTH_ENDPOINT = `${API_BASE_URL.replace('/api', '')}/health`;
const MAX_RETRIES = 20;
const RETRY_INTERVAL = 3000; // 3 seconds
const ESTIMATED_COLD_START_TIME = 50; // Render free tier typically takes 30-50 seconds

interface Props {
  children: ReactNode;
}

export function BackendHealthProvider({ children }: Props) {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(ESTIMATED_COLD_START_TIME);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(HEALTH_ENDPOINT, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsBackendReady(true);
        setIsChecking(false);
        setError(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: ReturnType<typeof setTimeout>;

    const performHealthCheck = async () => {
      if (!isMounted) return;

      const isHealthy = await checkHealth();

      if (isHealthy) {
        setIsChecking(false);
        return;
      }

      if (retryCount < MAX_RETRIES && isMounted) {
        setRetryCount((prev) => prev + 1);
        retryTimeout = setTimeout(performHealthCheck, RETRY_INTERVAL);
      } else if (isMounted) {
        setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
        setIsChecking(false);
      }
    };

    // Start countdown timer
    const countdownInterval = setInterval(() => {
      setEstimatedWaitTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Initial health check
    performHealthCheck();

    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
      clearInterval(countdownInterval);
    };
  }, [checkHealth, retryCount]);

  return (
    <BackendHealthContext.Provider
      value={{
        isBackendReady,
        isChecking,
        retryCount,
        estimatedWaitTime,
        error,
        checkHealth,
      }}
    >
      {children}
    </BackendHealthContext.Provider>
  );
}

export function useBackendHealth() {
  const context = useContext(BackendHealthContext);
  if (context === undefined) {
    throw new Error('useBackendHealth must be used within a BackendHealthProvider');
  }
  return context;
}
