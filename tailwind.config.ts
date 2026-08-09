import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#E5C158',
          500: '#D4AF37',  // Koulè prensipal Lò
          600: '#B49450',  // Lò fonse (hover)
          700: '#8B6914',
        },
        dark: {
          DEFAULT: '#000000',
          900: '#000000',
          800: '#0A0A0A',
          700: '#1A1A1A',
          600: '#222222',
          500: '#333333',
        },
        gray: {
          DEFAULT: '#A0A0A0',
          light: '#C0C0C0',
          medium: '#808080',
          dark: '#404040',
        },
        error: '#FF3333',
        success: '#33CC66',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      fontSize: {
        'display-xl': ['8rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-lg': ['6rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-md': ['4rem', { lineHeight: '0.95', letterSpacing: '-0.01em' }],
        'display-sm': ['3rem', { lineHeight: '1', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'draw-line': 'drawLine 1.5s ease-in-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B49450 50%, #8B6914 100%)',
        'dark-gradient': 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
      },
    },
  },
  plugins: [],
}
export default config
