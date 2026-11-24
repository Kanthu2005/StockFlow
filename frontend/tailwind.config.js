/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          accent: {
            DEFAULT: '#2563eb', // Single professional blue accent
            hover: '#1d4ed8',
            light: '#eff6ff',
            muted: '#bfdbfe',
          },
        },
        fontFamily: {
          sans: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ],
          mono: [
            'ui-monospace',
            'SFMono-Regular',
            'Menlo',
            'Monaco',
            'Consolas',
            'monospace',
          ],
        },
        borderRadius: {
          DEFAULT: '0.375rem',
          md: '0.375rem',
          lg: '0.5rem',
        },
      },
    },
    plugins: [],
  }
