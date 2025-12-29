/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF8E1',
          100: '#FFECB3',
          200: '#FFE082',
          300: '#FFD54F',
          400: '#FFCA28',
          500: '#FFC107', // amber
          600: '#FFB300',
          700: '#FFA000',
          800: '#FF8F00',
          900: '#FF6F00',
        },
        secondary: {
          50: '#FFF9C4',
          100: '#FFF59D',
          200: '#FFF176',
          300: '#FFEE58',
          400: '#FFEB3B',
          500: '#FFD700', // gold
          600: '#FBC02D',
          700: '#F9A825',
          800: '#F57F17',
          900: '#FF6F00',
        },
        accent: {
          50: '#EFEBE9',
          100: '#D7CCC8',
          200: '#BCAAA4',
          300: '#A1887F',
          400: '#8D6E63',
          500: '#8B4513', // brown
          600: '#6D4C41',
          700: '#5D4037',
          800: '#4E342E',
          900: '#3E2723',
        },
        neutral: {
          50: '#FFFEF0',
          100: '#FFFDE7',
          200: '#FFFDD0',
          300: '#FFF9C4',
          400: '#FFF59D',
          500: '#FFF176',
          600: '#FFEE58',
          700: '#FFEB3B',
          800: '#FDD835',
          900: '#FBC02D',
        },
        success: {
          500: '#4CAF50',
        },
        warning: {
          500: '#FF9800',
        },
        error: {
          500: '#F44336',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'honey': '0 4px 14px 0 rgba(255, 193, 7, 0.3)',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};