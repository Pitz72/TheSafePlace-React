/**
 * CRT Theme - Design system retrò con estetica anni '80
 * Tema fosforescente verde con effetti CRT
 */

export interface CRTTheme {
  colors: {
    primary: {
      green: string;
      greenBright: string;
      greenDark: string;
      greenGlow: string;
    };
    secondary: {
      amber: string;
      blue: string;
      red: string;
    };
    neutral: {
      black: string;
      darkGray: string;
      gray: string;
      lightGray: string;
      white: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  typography: {
    fontFamily: {
      primary: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  effects: {
    glow: {
      text: string;
      border: string;
      background: string;
    };
    scanlines: {
      opacity: string;
      animation: string;
    };
    flicker: {
      animation: string;
    };
    crt: {
      filter: string;
    };
  };
  animations: {
    scanline: string;
    flicker: string;
    glow: string;
    blink: string;
  };
}

export const crtTheme: CRTTheme = {
  colors: {
    primary: {
      green: '#00ff00',
      greenBright: '#33ff33',
      greenDark: '#008800',
      greenGlow: '#00ff00'
    },
    secondary: {
      amber: '#ffb000',
      blue: '#0088ff',
      red: '#ff4444'
    },
    neutral: {
      black: '#000000',
      darkGray: '#111111',
      gray: '#333333',
      lightGray: '#666666',
      white: '#cccccc'
    },
    status: {
      success: '#00ff00',
      warning: '#ffb000',
      error: '#ff4444',
      info: '#0088ff'
    }
  },

  typography: {
    fontFamily: {
      primary: '"Courier New", monospace',
      mono: '"Courier New", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    },
    fontWeight: {
      normal: '400',
      bold: '700'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    full: '9999px'
  },

  effects: {
    glow: {
      text: '0 0 5px currentColor',
      border: '0 0 10px currentColor',
      background: '0 0 20px rgba(0, 255, 0, 0.3)'
    },
    scanlines: {
      opacity: '0.1',
      animation: 'scanline 0.1s linear infinite'
    },
    flicker: {
      animation: 'flicker 2s infinite'
    },
    crt: {
      filter: 'contrast(1.1) brightness(1.1) saturate(1.2)'
    }
  },

  animations: {
    scanline: `
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }
    `,
    flicker: `
      @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.98; }
        51% { opacity: 1; }
        52% { opacity: 0.95; }
        53% { opacity: 1; }
      }
    `,
    glow: `
      @keyframes glow {
        0%, 100% { text-shadow: 0 0 5px currentColor; }
        50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
      }
    `,
    blink: `
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
    `
  }
};

/**
 * Genera classi CSS per il tema CRT
 */
export function generateCRTCSS(): string {
  return `
    /* CRT Theme Variables */
    :root {
      --crt-green: ${crtTheme.colors.primary.green};
      --crt-green-bright: ${crtTheme.colors.primary.greenBright};
      --crt-green-dark: ${crtTheme.colors.primary.greenDark};
      --crt-green-glow: ${crtTheme.colors.primary.greenGlow};

      --crt-amber: ${crtTheme.colors.secondary.amber};
      --crt-blue: ${crtTheme.colors.secondary.blue};
      --crt-red: ${crtTheme.colors.secondary.red};

      --crt-black: ${crtTheme.colors.neutral.black};
      --crt-dark-gray: ${crtTheme.colors.neutral.darkGray};
      --crt-gray: ${crtTheme.colors.neutral.gray};
      --crt-light-gray: ${crtTheme.colors.neutral.lightGray};
      --crt-white: ${crtTheme.colors.neutral.white};

      --crt-font-family: ${crtTheme.typography.fontFamily.primary};
      --crt-font-size-base: ${crtTheme.typography.fontSize.base};
    }

    /* CRT Base Styles */
    .crt-theme {
      font-family: var(--crt-font-family);
      color: var(--crt-green);
      background-color: var(--crt-black);
      line-height: ${crtTheme.typography.lineHeight.normal};
    }

    .crt-theme * {
      font-family: inherit;
    }

    /* CRT Effects */
    .crt-glow {
      text-shadow: ${crtTheme.effects.glow.text};
      animation: ${crtTheme.animations.glow};
    }

    .crt-flicker {
      animation: ${crtTheme.animations.flicker};
    }

    .crt-scanlines::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 0, ${crtTheme.effects.scanlines.opacity}) 2px,
        rgba(0, 255, 0, ${crtTheme.effects.scanlines.opacity}) 4px
      );
      pointer-events: none;
      animation: ${crtTheme.animations.scanline};
    }

    .crt-border {
      border: 1px solid var(--crt-green);
      box-shadow: ${crtTheme.effects.glow.border};
    }

    .crt-button {
      background: var(--crt-dark-gray);
      border: 1px solid var(--crt-green);
      color: var(--crt-green);
      padding: ${crtTheme.spacing.sm} ${crtTheme.spacing.md};
      border-radius: ${crtTheme.borderRadius.sm};
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .crt-button:hover {
      background: var(--crt-gray);
      box-shadow: ${crtTheme.effects.glow.background};
    }

    .crt-button:active {
      background: var(--crt-green-dark);
      color: var(--crt-black);
    }

    .crt-input {
      background: var(--crt-black);
      border: 1px solid var(--crt-green);
      color: var(--crt-green);
      padding: ${crtTheme.spacing.sm};
      border-radius: ${crtTheme.borderRadius.sm};
    }

    .crt-input:focus {
      outline: none;
      box-shadow: ${crtTheme.effects.glow.border};
    }

    .crt-panel {
      background: var(--crt-dark-gray);
      border: 1px solid var(--crt-green);
      border-radius: ${crtTheme.borderRadius.md};
      padding: ${crtTheme.spacing.md};
      box-shadow: ${crtTheme.effects.glow.background};
    }

    .crt-text-success { color: var(--crt-green); }
    .crt-text-warning { color: var(--crt-amber); }
    .crt-text-error { color: var(--crt-red); }
    .crt-text-info { color: var(--crt-blue); }

    /* Animations */
    ${crtTheme.animations.scanline}
    ${crtTheme.animations.flicker}
    ${crtTheme.animations.glow}
    ${crtTheme.animations.blink}

    /* CRT Filter Effect */
    .crt-filter {
      filter: ${crtTheme.effects.crt.filter};
    }

    /* Keyboard Navigation */
    .crt-focus:focus {
      outline: 2px solid var(--crt-green);
      outline-offset: 2px;
      box-shadow: ${crtTheme.effects.glow.border};
    }

    /* Responsive Typography */
    @media (max-width: 768px) {
      .crt-theme {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .crt-theme {
        font-size: 0.8rem;
      }
    }
  `;
}

/**
 * Hook per utilizzare il tema CRT in componenti React
 */
export function useCRTTheme() {
  return {
    theme: crtTheme,
    classes: {
      theme: 'crt-theme',
      glow: 'crt-glow',
      flicker: 'crt-flicker',
      scanlines: 'crt-scanlines',
      border: 'crt-border',
      button: 'crt-button',
      input: 'crt-input',
      panel: 'crt-panel',
      focus: 'crt-focus',
      filter: 'crt-filter',
      textSuccess: 'crt-text-success',
      textWarning: 'crt-text-warning',
      textError: 'crt-text-error',
      textInfo: 'crt-text-info'
    }
  };
}