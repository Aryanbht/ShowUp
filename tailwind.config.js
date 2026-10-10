/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFC629',
        cream: '#FBF6E9',
        canvas: '#E8F1FB',
        ink: '#0F1B2D',
        surface: '#FFFFFF',
        muted: '#4B5B73',
        accent: '#FFC629',
        'accent-hover': '#FFD24F',
        violet: '#7C3AED',
        // Sky palette
        sky: {
          50: '#F2F8FE',
          100: '#E8F1FB',
          200: '#C9DBF0',
          400: '#6FA8DC',
          600: '#3B7DC4',
        },
        // Legacy aliases kept
        'surface-dim': '#dcd9d9',
        'surface-low': '#f6f3f2',
        'on-surface': '#0F1B2D',
        'on-surface-variant': '#4B5B73',
        outline: '#0F1B2D',
        'outline-variant': '#C9DBF0',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        // New design system shadows (ink = #0F1B2D)
        brutal:    '3px 3px 0px 0px #0F1B2D',
        'brutal-lg': '5px 5px 0px 0px #0F1B2D',
        'brutal-xl': '8px 8px 0px 0px #0F1B2D',
        'brutal-sm': '2px 2px 0px 0px #0F1B2D',
        'brutal-none': '0px 0px 0px 0px #0F1B2D',
      },
      borderWidth: {
        3: '3px',
      },
      borderRadius: {
        card: '1rem',   // rounded-2xl
        input: '0.75rem', // rounded-xl
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 1s linear infinite',
        marquee: 'marquee 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      transitionDuration: {
        120: '120ms',
      },
    },
  },
  plugins: [],
}
