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
          DEFAULT: '#E11D74',
          soft: '#FDE7F0',
        },
        background: '#FFF8FA',
        surface: '#FFFFFF',
        textMain: '#2D1B2E',
        textMuted: '#7A6A7C',
        success: '#3FA672',
        warning: '#F5A524',
        danger: '#D64545',
        phase: {
          menstrual: '#E85D75',
          follicular: '#6CC299',
          ovulation: '#F7C948',
          luteal: '#9B8AE0',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
