
/**
 * Theme configuration that can be easily imported in Next.js
 */

export const themeColors = {
    // Light mode colors
    light: {
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(222.2 84% 4.9%)',
      popover: 'hsl(0 0% 100%)',
      popoverForeground: 'hsl(222.2 84% 4.9%)',
      primary: 'hsl(142 72% 29%)',
      primaryForeground: 'hsl(210 40% 98%)',
      secondary: 'hsl(142 63% 95%)',
      secondaryForeground: 'hsl(142 76% 10%)',
      muted: 'hsl(142 10% 93%)',
      mutedForeground: 'hsl(215.4 16.3% 46.9%)',
      accent: 'hsl(142 70% 50%)',
      accentForeground: 'hsl(210 40% 98%)',
      destructive: 'hsl(0 84.2% 60.2%)',
      destructiveForeground: 'hsl(210 40% 98%)',
      border: 'hsl(142 20% 87%)',
      input: 'hsl(142 20% 87%)',
      ring: 'hsl(142 76% 29%)',
    },
    // Dark mode colors
    dark: {
      background: 'hsl(142 35% 6%)',
      foreground: 'hsl(142 10% 95%)',
      card: 'hsl(142 35% 8%)',
      cardForeground: 'hsl(142 10% 95%)',
      popover: 'hsl(142 35% 8%)',
      popoverForeground: 'hsl(142 10% 95%)',
      primary: 'hsl(142 76% 40%)',
      primaryForeground: 'hsl(142 10% 5%)',
      secondary: 'hsl(142 25% 16%)',
      secondaryForeground: 'hsl(142 10% 95%)',
      muted: 'hsl(142 25% 16%)',
      mutedForeground: 'hsl(142 10% 70%)',
      accent: 'hsl(142 76% 40%)',
      accentForeground: 'hsl(142 10% 5%)',
      destructive: 'hsl(0 74% 42%)',
      destructiveForeground: 'hsl(142 10% 95%)',
      border: 'hsl(142 25% 20%)',
      input: 'hsl(142 25% 20%)',
      ring: 'hsl(142 76% 40%)',
    },
    radius: '0.75rem',
  };
  
  // Animation keyframes that can be imported in Next.js
  export const keyframes = {
    accordionDown: {
      from: { height: 0 },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
    accordionUp: {
      from: { height: 'var(--radix-accordion-content-height)' },
      to: { height: 0 },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    pulseSoft: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.8 },
    },
    spinSlow: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    fadeIn: {
      '0%': { opacity: 0, transform: 'translateY(10px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: 0 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    slideInRight: {
      '0%': { transform: 'translateX(100%)' },
      '100%': { transform: 'translateX(0)' },
    },
    slideInLeft: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' },
    },
    rotateIn: {
      '0%': { transform: 'rotate(-10deg) scale(0.95)', opacity: 0 },
      '100%': { transform: 'rotate(0) scale(1)', opacity: 1 },
    },
    bounceGentle: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-5px)' },
    },
    morphingBlob: {
      '0%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
      '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
      '100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
    },
  };
  
  // Custom utility classes that can be used with Tailwind in Next.js
  export const customUtilities = {
    '.glass-card': {
      '@apply bg-white/80 dark:bg-gray-800/30 backdrop-blur-md border border-gray-100 dark:border-gray-800 shadow-lg': {},
    },
    '.gradient-text': {
      '@apply text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent': {},
    },
    '.gradient-bg': {
      '@apply bg-gradient-to-r from-primary to-accent text-primary-foreground': {},
    },
    '.section-padding': {
      '@apply py-16 md:py-24': {},
    },
    '.section-title': {
      '@apply text-3xl md:text-4xl lg:text-5xl font-bold mb-6': {},
    },
    '.section-description': {
      '@apply text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12': {},
    },
    '.button-3d': {
      '@apply relative overflow-hidden transition-all duration-300 transform active:scale-95 hover:-translate-y-1': {},
    },
    '.hover-card': {
      '@apply transition-all duration-300 hover:shadow-xl hover:-translate-y-1': {},
    },
    '.hover-glow:hover': {
      boxShadow: '0 0 15px theme("colors.primary.DEFAULT")',
    },
    '.hover-lift': {
      '@apply transition-transform duration-300 hover:-translate-y-1': {},
    },
  };
  