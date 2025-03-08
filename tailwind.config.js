/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700',
        'primary-content': '#1a1a1a',
        secondary: '#2a2a2a',
        accent: '#FFE55C',
        neutral: '#1a1a1a',
        'base-300': '#121212',
        'base-250': '#1a1a1a',
        'base-200': '#1E1E1E',
        'base-100': '#333333',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        jsexplorer: {
          primary: '#FFD700',
          'primary-content': '#1a1a1a',
          secondary: '#2a2a2a',
          accent: '#FFE55C',
          neutral: '#1a1a1a',
          'base-300': '#121212',
          'base-200': '#1E1E1E',
          'base-100': '#333333',
        },
      },
    ],
    darkTheme: 'jsexplorer',
  },
}