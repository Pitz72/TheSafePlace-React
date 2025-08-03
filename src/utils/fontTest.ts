// Font Test Utility - Test Cross-Browser Font Rendering
export class FontTester {
  private static instance: FontTester;
  private testResults: Map<string, boolean> = new Map();

  static getInstance(): FontTester {
    if (!FontTester.instance) {
      FontTester.instance = new FontTester();
    }
    return FontTester.instance;
  }

  // Test disponibilità font IBM PC
  testIBMPCFont(): boolean {
    const testString = 'IBM Plex Mono Test 0123456789';
    const testElement = document.createElement('div');
    testElement.style.fontFamily = 'IBM Plex Mono, monospace';
    testElement.style.fontSize = '16px';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.textContent = testString;
    
    document.body.appendChild(testElement);
    
    const originalWidth = testElement.offsetWidth;
    testElement.style.fontFamily = 'monospace';
    const fallbackWidth = testElement.offsetWidth;
    
    document.body.removeChild(testElement);
    
    const isIBMPCLoaded = originalWidth !== fallbackWidth;
    this.testResults.set('ibm-pc-loaded', isIBMPCLoaded);
    
    console.log(`IBM Plex Mono loaded: ${isIBMPCLoaded}`);
    return isIBMPCLoaded;
  }

  // Test fallback fonts
  testFallbackFonts(): Map<string, boolean> {
    const fallbacks = [
      'Courier New',
      'Consolas', 
      'Monaco',
      'Menlo',
      'Ubuntu Mono',
      'DejaVu Sans Mono'
    ];

    fallbacks.forEach(font => {
      const isAvailable = this.testFontAvailability(font);
      this.testResults.set(`fallback-${font.toLowerCase().replace(' ', '-')}`, isAvailable);
      console.log(`${font} available: ${isAvailable}`);
    });

    return this.testResults;
  }

  // Test disponibilità singolo font
  private testFontAvailability(fontName: string): boolean {
    const testElement = document.createElement('div');
    testElement.style.fontFamily = fontName;
    testElement.style.fontSize = '16px';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.textContent = 'Test';
    
    document.body.appendChild(testElement);
    
    const originalWidth = testElement.offsetWidth;
    testElement.style.fontFamily = 'monospace';
    const fallbackWidth = testElement.offsetWidth;
    
    document.body.removeChild(testElement);
    
    return originalWidth !== fallbackWidth;
  }

  // Test rendering qualità
  testRenderingQuality(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'canvas-not-supported';

    canvas.width = 200;
    canvas.height = 50;
    
    ctx.font = '16px IBM Plex Mono, monospace';
    ctx.fillStyle = '#4EA162';
    ctx.fillText('IBM Plex Mono Rendering Test', 10, 30);
    
    // Analisi qualità rendering (semplificata)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some(pixel => pixel > 0);
    
    this.testResults.set('rendering-quality', hasContent);
    return hasContent ? 'good' : 'poor';
  }

  // Test completo
  runCompleteTest(): Map<string, any> {
    console.log('🔤 Starting Font IBM PC Cross-Browser Test...');
    
    this.testIBMPCFont();
    this.testFallbackFonts();
    const quality = this.testRenderingQuality();
    this.testResults.set('rendering-quality', quality === 'good');
    
    console.log('🔤 Font Test Results:', Object.fromEntries(this.testResults));
    return this.testResults;
  }

  // Get test results
  getResults(): Map<string, boolean> {
    return this.testResults;
  }
}

// Export singleton instance
export const fontTester = FontTester.getInstance(); 