// Readability Test Utility - Test leggibilità font IBM PC
export class ReadabilityTester {
  private static instance: ReadabilityTester;
  private testResults: Map<string, any> = new Map();

  static getInstance(): ReadabilityTester {
    if (!ReadabilityTester.instance) {
      ReadabilityTester.instance = new ReadabilityTester();
    }
    return ReadabilityTester.instance;
  }

  // Test contrasto e leggibilità
  testContrastRatio(): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    canvas.width = 200;
    canvas.height = 50;
    
    // Sfondo nero
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Testo verde fosforo
    ctx.font = '16px IBM Plex Mono, monospace';
    ctx.fillStyle = '#4EA162';
    ctx.fillText('IBM Plex Mono Readability Test', 10, 30);
    
    // Calcolo contrasto semplificato
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let textPixels = 0;
    let totalPixels = 0;
    
    for (let i = 0; i < pixels.length; i += 4) {
      totalPixels++;
      if (pixels[i] > 0 || pixels[i + 1] > 0 || pixels[i + 2] > 0) {
        textPixels++;
      }
    }
    
    const contrastRatio = textPixels / totalPixels;
    this.testResults.set('contrast-ratio', contrastRatio);
    
    console.log(`📊 Contrast ratio: ${contrastRatio.toFixed(3)}`);
    return contrastRatio;
  }

  // Test dimensione font su diverse risoluzioni
  testFontSizeReadability(): Map<string, boolean> {
    const resolutions = [
      { width: 1920, height: 1080, name: 'Full HD' },
      { width: 1366, height: 768, name: 'HD' }
      // Rimossi test mobile e tablet - gioco keyboard-only desktop
    ];

    const results = new Map<string, boolean>();

    resolutions.forEach(resolution => {
      const isReadable = this.testResolutionReadability(resolution.width, resolution.height);
      results.set(resolution.name, isReadable);
      this.testResults.set(`readable-${resolution.name.toLowerCase().replace(' ', '-')}`, isReadable);
      console.log(`📱 ${resolution.name} (${resolution.width}x${resolution.height}): ${isReadable ? '✅' : '❌'} Leggibile`);
    });

    return results;
  }

  // Test leggibilità per risoluzione specifica
  private testResolutionReadability(width: number, height: number): boolean {
    const testElement = document.createElement('div');
    testElement.style.fontFamily = 'IBM Plex Mono, monospace';
    testElement.style.fontSize = '0.875rem';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.style.width = `${width}px`;
    testElement.style.height = `${height}px`;
    testElement.textContent = 'The Safe Place - IBM Plex Mono Readability Test 0123456789';
    
    document.body.appendChild(testElement);
    
    const textWidth = testElement.scrollWidth;
    const textHeight = testElement.scrollHeight;
    
    document.body.removeChild(testElement);
    
    // Criteri di leggibilità
    const isWidthReadable = textWidth <= width * 0.9; // 90% della larghezza
    const isHeightReadable = textHeight <= height * 0.1; // 10% dell'altezza
    
    return isWidthReadable && isHeightReadable;
  }

  // Test caratteri speciali e numeri
  testSpecialCharacters(): boolean {
    const testChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?';
    const testElement = document.createElement('div');
    testElement.style.fontFamily = 'IBM Plex Mono, monospace';
    testElement.style.fontSize = '16px';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.textContent = testChars;
    
    document.body.appendChild(testElement);
    
    const originalWidth = testElement.offsetWidth;
    testElement.style.fontFamily = 'monospace';
    const fallbackWidth = testElement.offsetWidth;
    
    document.body.removeChild(testElement);
    
    const isSpecialCharsSupported = originalWidth !== fallbackWidth;
    this.testResults.set('special-characters', isSpecialCharsSupported);
    
    console.log(`🔤 Special characters supported: ${isSpecialCharsSupported ? '✅' : '❌'}`);
    return isSpecialCharsSupported;
  }

  // Test line-height e spacing
  testLineSpacing(): number {
    const testElement = document.createElement('div');
    testElement.style.fontFamily = 'IBM Plex Mono, monospace';
    testElement.style.fontSize = '16px';
    testElement.style.lineHeight = '1.25';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.innerHTML = 'Line 1<br>Line 2<br>Line 3';
    
    document.body.appendChild(testElement);
    
    const lineHeight = testElement.offsetHeight / 3; // 3 linee
    const fontSize = 16;
    const spacingRatio = lineHeight / fontSize;
    
    document.body.removeChild(testElement);
    
    this.testResults.set('line-spacing-ratio', spacingRatio);
    console.log(`📏 Line spacing ratio: ${spacingRatio.toFixed(2)}`);
    return spacingRatio;
  }

  // Test completo leggibilità
  runCompleteReadabilityTest(): Map<string, any> {
    console.log('📖 Starting IBM Plex Mono Readability Test...');
    
    this.testContrastRatio();
    this.testFontSizeReadability();
    this.testSpecialCharacters();
    this.testLineSpacing();
    
    console.log('📖 Readability Test Results:', Object.fromEntries(this.testResults));
    return this.testResults;
  }

  // Get test results
  getResults(): Map<string, any> {
    return this.testResults;
  }
}

// Export singleton instance
export const readabilityTester = ReadabilityTester.getInstance();