/** @type {import('tailwindcss').Config} */
export default {
  content: { relative: true, files: ['./index.html', './src/**/*.{js,jsx}'] },
  theme: {
    extend: {
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          dark: '#5B21B6',
          light: '#A78BFA',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
        success: {
          DEFAULT: '#16A34A',
          dark: '#166534',
        },
        danger: {
          DEFAULT: '#E11D48',
          dark: '#9F1239',
        },
        board: '#FFF8F0',
      },
      boxShadow: {
        card: '0 4px 0 0 rgba(0,0,0,0.15)',
        popup: '0 10px 30px -5px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
