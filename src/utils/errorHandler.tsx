import React, { Component, type ErrorInfo, type ReactNode } from 'react';

// Error Types
export enum ErrorType {
  RUNTIME = 'runtime',
  NETWORK = 'network',
  SAVE_SYSTEM = 'save_system',
  GAME_LOGIC = 'game_logic',
  VALIDATION = 'validation',
  UI = 'ui'
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Game Error Interface
export interface GameError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
  userAgent: string;
  url: string;
}

// Error Boundary Props
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: GameError) => void;
  maxRetries?: number;
}

// Error Boundary State
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

// Error Fallback Props
interface ErrorFallbackProps {
  error: Error | null;
  errorId: string;
  onRetry: () => void;
  canRetry: boolean;
}

// Utility function to generate unique error IDs
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Default Error Fallback UI
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorId, 
  onRetry, 
  canRetry 
}) => {
  return (
    <div className="min-h-screen bg-game-bg-primary flex items-center justify-center p-4">
      <div className="bg-game-bg-panel border border-phosphor-500 rounded-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-phosphor-500 text-xl font-ibm-pc font-bold mb-4">
            Sistema Error Detected
          </h1>
          <p className="text-phosphor-700 font-ibm-pc mb-4">
            Il sistema ha rilevato un errore critico. Questo potrebbe essere un bug temporaneo.
          </p>
          <div className="bg-game-bg-primary border border-phosphor-700 rounded p-3 mb-4">
            <p className="text-phosphor-400 font-ibm-pc text-sm">
              Error ID: {errorId}
            </p>
            {error && (
              <p className="text-phosphor-400 font-ibm-pc text-xs mt-2">
                {error.message}
              </p>
            )}
          </div>
          <div className="space-y-3">
            {canRetry && (
              <button
                onClick={onRetry}
                className="w-full bg-phosphor-500 hover:bg-phosphor-400 text-game-bg-primary font-ibm-pc font-bold py-2 px-4 rounded transition-colors"
              >
                Riprova
              </button>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-phosphor-700 hover:bg-phosphor-600 text-phosphor-100 font-ibm-pc font-bold py-2 px-4 rounded transition-colors"
            >
              Ricarica Applicazione
            </button>
          </div>
          <p className="text-phosphor-600 font-ibm-pc text-xs mt-4">
            Se il problema persiste, controlla la console del browser per ulteriori dettagli.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Error Boundary Component
export class GameErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries: number;
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries || 3;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId()
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    const gameError: GameError = {
      id: this.state.errorId,
      type: this.categorizeError(error),
      severity: this.determineSeverity(error),
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context: {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Log error
    this.logError(gameError);
    
    // Call error handler if provided
    if (this.props.onError) {
      this.props.onError(gameError);
    }
  }
  
  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    if (message.includes('save') || message.includes('load')) {
      return ErrorType.SAVE_SYSTEM;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    if (message.includes('game') || message.includes('player') || message.includes('stat')) {
      return ErrorType.GAME_LOGIC;
    }
    
    return ErrorType.RUNTIME;
  }
  
  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    
    if (message.includes('critical') || message.includes('fatal')) {
      return ErrorSeverity.CRITICAL;
    }
    if (message.includes('save') || message.includes('data')) {
      return ErrorSeverity.HIGH;
    }
    if (message.includes('network') || message.includes('ui')) {
      return ErrorSeverity.MEDIUM;
    }
    
    return ErrorSeverity.LOW;
  }
  
  private logError(gameError: GameError) {
    // Console logging
    console.group(`🚨 Game Error [${gameError.severity}]`);
    console.error('Error ID:', gameError.id);
    console.error('Type:', gameError.type);
    console.error('Message:', gameError.message);
    console.error('Stack:', gameError.stack);
    console.error('Context:', gameError.context);
    console.groupEnd();
    
    // In production, send to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToService(gameError);
    }
  }
  
  private async sendErrorToService(gameError: GameError) {
    try {
      // Example: Send to error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(gameError)
      // });
      
      // For now, just store in localStorage for development
      const errorKey = `error_${gameError.id}`;
      localStorage.setItem(errorKey, JSON.stringify(gameError));
    } catch (error) {
      console.warn('Failed to send error to service:', error);
    }
  }
  
  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
        retryCount: prevState.retryCount + 1
      }));
    }
  }
  
  render(): ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      const canRetry = this.state.retryCount < this.maxRetries;
      
      return React.createElement(FallbackComponent, {
        error: this.state.error,
        errorId: this.state.errorId,
        onRetry: this.handleRetry,
        canRetry: canRetry
      });
    }
    
    return this.props.children;
  }
}

// Global error handler for unhandled errors
export const initializeGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const gameError: GameError = {
      id: generateErrorId(),
      type: ErrorType.RUNTIME,
      severity: ErrorSeverity.HIGH,
      message: `Unhandled Promise Rejection: ${event.reason}`,
      timestamp: Date.now(),
      context: {
        type: 'unhandledrejection',
        reason: event.reason
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('🚨 Unhandled Promise Rejection:', gameError);
    
    // Store in localStorage for debugging
    const errorKey = `error_${gameError.id}`;
    localStorage.setItem(errorKey, JSON.stringify(gameError));
  });
  
  // Handle other unhandled errors
  window.addEventListener('error', (event) => {
    const gameError: GameError = {
      id: generateErrorId(),
      type: ErrorType.RUNTIME,
      severity: ErrorSeverity.MEDIUM,
      message: event.message,
      stack: event.error?.stack,
      timestamp: Date.now(),
      context: {
        type: 'error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('🚨 Unhandled Error:', gameError);
    
    // Store in localStorage for debugging
    const errorKey = `error_${gameError.id}`;
    localStorage.setItem(errorKey, JSON.stringify(gameError));
  });
};

// Export error utilities
export { generateErrorId };
export type { GameError, ErrorBoundaryProps, ErrorFallbackProps };