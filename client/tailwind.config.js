/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glass: '0 8px 30px rgba(0, 0, 0, 0.12)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.7' },
          '50%': { opacity: '1' }
        }
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        pulseGlow: 'pulseGlow 4s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
