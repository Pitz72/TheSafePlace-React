// Performance Monitor per The Safe Place v0.0.2
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  timestamp: number;
}

export interface PerformanceReport {
  averageFps: number;
  minFps: number;
  maxFps: number;
  averageMemory: number;
  peakMemory: number;
  averageCpu: number;
  peakCpu: number;
  totalSamples: number;
  duration: number;
}

class PerformanceMonitor {
  private fpsCounter = 0;
  private lastTime = performance.now();
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  private cpuHistory: number[] = [];
  private renderHistory: number[] = [];
  private isMonitoring = false;
  private monitoringInterval: number | null = null;
  private frameCount = 0;
  private lastFrameTime = performance.now();

  // FPS Monitoring
  public updateFPS(): void {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.fpsHistory.push(fps);
      this.fpsCounter = fps;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  // Memory Monitoring
  public updateMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      this.memoryHistory.push(memoryUsage);
    }
  }

  // CPU Monitoring (simulated)
  public updateCPU(): void {
    const currentTime = performance.now();
    const renderTime = currentTime - this.lastFrameTime;
    this.renderHistory.push(renderTime);
    
    // Simulate CPU usage based on render time
    const cpuUsage = Math.min(100, (renderTime / 16.67) * 100); // 16.67ms = 60fps
    this.cpuHistory.push(cpuUsage);
    
    this.lastFrameTime = currentTime;
  }

  // Start monitoring
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.cpuHistory = [];
    this.renderHistory = [];
    
    this.monitoringInterval = window.setInterval(() => {
      this.updateMemory();
      this.updateCPU();
    }, 100); // Update every 100ms
    
    console.log('🔍 Performance monitoring started');
  }

  // Stop monitoring
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('⏹️ Performance monitoring stopped');
  }

  // Get current metrics
  public getCurrentMetrics(): PerformanceMetrics {
    return {
      fps: this.fpsCounter,
      memoryUsage: this.memoryHistory[this.memoryHistory.length - 1] || 0,
      cpuUsage: this.cpuHistory[this.cpuHistory.length - 1] || 0,
      renderTime: this.renderHistory[this.renderHistory.length - 1] || 0,
      timestamp: performance.now()
    };
  }

  // Generate performance report
  public generateReport(): PerformanceReport {
    const averageFps = this.fpsHistory.length > 0 
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length 
      : 0;
    
    const minFps = this.fpsHistory.length > 0 ? Math.min(...this.fpsHistory) : 0;
    const maxFps = this.fpsHistory.length > 0 ? Math.max(...this.fpsHistory) : 0;
    
    const averageMemory = this.memoryHistory.length > 0 
      ? this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length 
      : 0;
    
    const peakMemory = this.memoryHistory.length > 0 ? Math.max(...this.memoryHistory) : 0;
    
    const averageCpu = this.cpuHistory.length > 0 
      ? this.cpuHistory.reduce((a, b) => a + b, 0) / this.cpuHistory.length 
      : 0;
    
    const peakCpu = this.cpuHistory.length > 0 ? Math.max(...this.cpuHistory) : 0;
    
    const duration = this.renderHistory.length > 0 
      ? this.renderHistory.reduce((a, b) => a + b, 0) 
      : 0;

    return {
      averageFps: Math.round(averageFps * 100) / 100,
      minFps,
      maxFps,
      averageMemory: Math.round(averageMemory * 100) / 100,
      peakMemory: Math.round(peakMemory * 100) / 100,
      averageCpu: Math.round(averageCpu * 100) / 100,
      peakCpu: Math.round(peakCpu * 100) / 100,
      totalSamples: this.fpsHistory.length,
      duration: Math.round(duration)
    };
  }

  // Print performance report
  public printReport(): void {
    const report = this.generateReport();
    
    console.log('📊 PERFORMANCE REPORT');
    console.log('=====================');
    console.log(`FPS: ${report.averageFps} avg (${report.minFps}-${report.maxFps})`);
    console.log(`Memory: ${report.averageMemory} MB avg, ${report.peakMemory} MB peak`);
    console.log(`CPU: ${report.averageCpu}% avg, ${report.peakCpu}% peak`);
    console.log(`Samples: ${report.totalSamples}`);
    console.log(`Duration: ${report.duration}ms`);
    
    // Performance assessment
    if (report.averageFps >= 55) {
      console.log('✅ Performance: EXCELLENT (55+ FPS)');
    } else if (report.averageFps >= 45) {
      console.log('⚠️ Performance: GOOD (45-54 FPS)');
    } else if (report.averageFps >= 30) {
      console.log('⚠️ Performance: ACCEPTABLE (30-44 FPS)');
    } else {
      console.log('❌ Performance: POOR (<30 FPS)');
    }
    
    if (report.peakMemory < 50) {
      console.log('✅ Memory: EXCELLENT (<50 MB)');
    } else if (report.peakMemory < 100) {
      console.log('⚠️ Memory: GOOD (50-100 MB)');
    } else {
      console.log('❌ Memory: HIGH (>100 MB)');
    }
  }

  // Get FPS counter for display
  public getFPS(): number {
    return this.fpsCounter;
  }

  // Check if monitoring is active
  public isActive(): boolean {
    return this.isMonitoring;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring after 2 seconds
setTimeout(() => {
  performanceMonitor.startMonitoring();
}, 2000); 