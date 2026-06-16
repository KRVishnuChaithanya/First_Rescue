/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#E24B4A',
          darkRed: '#A32D2D',
          lightRed: '#FCEBEB',
        },
        success: {
          green: '#2E7D32',
          light: '#EAF3DE',
        },
        warning: {
          amber: '#BA7517',
          light: '#FAEEDA',
        },
        dark: {
          black: '#0A0A0A',
          gray: '#141414',
        },
        light: {
          gray: '#F8F7F4',
          card: '#FFFFFF',
        },
        border: '#E0DED8'
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow-red': '0 0 30px rgba(226, 75, 74, 0.5)',
        'glow-green': '0 0 30px rgba(46, 125, 50, 0.5)',
      }
    },
  },
  plugins: [],
}
