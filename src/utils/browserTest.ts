// Browser Compatibility Test per The Safe Place v0.0.2
export interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
  isSupported: boolean;
  features: {
    cssVariables: boolean;
    cssGrid: boolean;
    flexbox: boolean;
    transform3d: boolean;
    animation: boolean;
    performance: boolean;
    memory: boolean;
  };
}

export interface BrowserTestResult {
  browser: BrowserInfo;
  tests: {
    cssVariables: boolean;
    cssGrid: boolean;
    flexbox: boolean;
    transform3d: boolean;
    animation: boolean;
    performance: boolean;
    memory: boolean;
    crtEffects: boolean;
    scaling: boolean;
  };
  score: number;
  status: 'excellent' | 'good' | 'acceptable' | 'poor';
}

class BrowserTester {
  private browserInfo: BrowserInfo;

  constructor() {
    this.browserInfo = this.detectBrowser();
  }

  private detectBrowser(): BrowserInfo {
    const userAgent = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    let isSupported = false;

    // Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      isSupported = parseInt(version) >= 120;
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      isSupported = parseInt(version) >= 115;
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      isSupported = parseInt(version) >= 17;
    }
    // Edge
    else if (userAgent.includes('Edg')) {
      name = 'Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      isSupported = parseInt(version) >= 120;
    }

    return {
      name,
      version,
      userAgent,
      isSupported,
      features: {
        cssVariables: this.testCSSVariables(),
        cssGrid: this.testCSSGrid(),
        flexbox: this.testFlexbox(),
        transform3d: this.testTransform3D(),
        animation: this.testAnimation(),
        performance: this.testPerformance(),
        memory: this.testMemory()
      }
    };
  }

  private testCSSVariables(): boolean {
    const testElement = document.createElement('div');
    testElement.style.setProperty('--test-var', 'red');
    return testElement.style.getPropertyValue('--test-var') === 'red';
  }

  private testCSSGrid(): boolean {
    const testElement = document.createElement('div');
    testElement.style.display = 'grid';
    return testElement.style.display === 'grid';
  }

  private testFlexbox(): boolean {
    const testElement = document.createElement('div');
    testElement.style.display = 'flex';
    return testElement.style.display === 'flex';
  }

  private testTransform3D(): boolean {
    const testElement = document.createElement('div');
    testElement.style.transform = 'translate3d(0,0,0)';
    return testElement.style.transform.includes('translate3d');
  }

  private testAnimation(): boolean {
    const testElement = document.createElement('div');
    testElement.style.animation = 'test 1s';
    return testElement.style.animation.includes('test');
  }

  private testPerformance(): boolean {
    return 'performance' in window && 'now' in performance;
  }

  private testMemory(): boolean {
    return 'memory' in performance;
  }

  private testCRTEffects(): boolean {
    // Test if CRT effects work
    const testElement = document.createElement('div');
    testElement.style.textShadow = '0 0 3px #4EA162';
    return testElement.style.textShadow.includes('0 0 3px');
  }

  private testScaling(): boolean {
    // Test if CSS transform scale works
    const testElement = document.createElement('div');
    testElement.style.transform = 'scale(0.5)';
    return testElement.style.transform.includes('scale');
  }

  // Rimosso test responsive - gioco keyboard-only desktop

  public runTests(): BrowserTestResult {
    const tests = {
      cssVariables: this.browserInfo.features.cssVariables,
      cssGrid: this.browserInfo.features.cssGrid,
      flexbox: this.browserInfo.features.flexbox,
      transform3d: this.browserInfo.features.transform3d,
      animation: this.browserInfo.features.animation,
      performance: this.browserInfo.features.performance,
      memory: this.browserInfo.features.memory,
      crtEffects: this.testCRTEffects(),
      scaling: this.testScaling()
    };

    const passedTests = Object.values(tests).filter(Boolean).length;
    const totalTests = Object.keys(tests).length;
    const score = Math.round((passedTests / totalTests) * 100);

    let status: 'excellent' | 'good' | 'acceptable' | 'poor';
    if (score >= 90) status = 'excellent';
    else if (score >= 80) status = 'good';
    else if (score >= 70) status = 'acceptable';
    else status = 'poor';

    return {
      browser: this.browserInfo,
      tests,
      score,
      status
    };
  }

  public printReport(): void {
    const result = this.runTests();
    
    console.log('🌐 BROWSER COMPATIBILITY REPORT');
    console.log('================================');
    console.log(`Browser: ${result.browser.name} ${result.browser.version}`);
    console.log(`Supported: ${result.browser.isSupported ? '✅ YES' : '❌ NO'}`);
    console.log(`Score: ${result.score}/100 (${result.status.toUpperCase()})`);
    console.log('');
    console.log('Feature Tests:');
    console.log(`  CSS Variables: ${result.tests.cssVariables ? '✅' : '❌'}`);
    console.log(`  CSS Grid: ${result.tests.cssGrid ? '✅' : '❌'}`);
    console.log(`  Flexbox: ${result.tests.flexbox ? '✅' : '❌'}`);
    console.log(`  Transform 3D: ${result.tests.transform3d ? '✅' : '❌'}`);
    console.log(`  Animation: ${result.tests.animation ? '✅' : '❌'}`);
    console.log(`  Performance API: ${result.tests.performance ? '✅' : '❌'}`);
    console.log(`  Memory API: ${result.tests.memory ? '✅' : '❌'}`);
    console.log(`  CRT Effects: ${result.tests.crtEffects ? '✅' : '❌'}`);
    console.log(`  Scaling: ${result.tests.scaling ? '✅' : '❌'}`);
    console.log(`  Responsive: ❌ RIMOSSO (keyboard-only desktop)`);
    console.log('');
    
    if (result.score >= 90) {
      console.log('🎉 EXCELLENT compatibility - All features supported!');
    } else if (result.score >= 80) {
      console.log('✅ GOOD compatibility - Most features supported');
    } else if (result.score >= 70) {
      console.log('⚠️ ACCEPTABLE compatibility - Some features may not work optimally');
    } else {
      console.log('❌ POOR compatibility - Many features may not work');
    }
  }

  public getBrowserInfo(): BrowserInfo {
    return this.browserInfo;
  }
}

// Singleton instance
export const browserTester = new BrowserTester();

// Auto-run browser test after 3 seconds
setTimeout(() => {
  browserTester.printReport();
}, 3000);