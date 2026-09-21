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
        cream: '#FFF8E7',
        canvas: '#F4F4F0',
        ink: '#1A1A1A',
        surface: '#FFFFFF',
        'surface-dim': '#dcd9d9',
        'surface-low': '#f6f3f2',
        'on-surface': '#1c1b1b',
        'on-surface-variant': '#4f4633',
        outline: '#817660',
        'outline-variant': '#d3c5ac',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0px #1A1A1A',
        'brutal-lg': '6px 6px 0px #1A1A1A',
        'brutal-xl': '8px 8px 0px #1A1A1A',
        'brutal-sm': '2px 2px 0px #1A1A1A',
        'brutal-none': '0px 0px 0px #1A1A1A',
      },
      borderWidth: {
        3: '3px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 1s linear infinite',
        marquee: 'marquee 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
