/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FDFCF7',
          100: '#FBF8F1',
          200: '#F5EFE1',
          300: '#EFE7D3',
          400: '#E2D4BA',
          500: '#C8B291',
          600: '#A89270',
          700: '#867252',
          800: '#5F5039',
          900: '#3D3324',
        },
        noir: {
          800: '#2A303A',
          850: '#212731',
          900: '#1A212D',
          950: '#11161F',
        },
        accent: {
          gold: '#C5A880',
          bronze: '#A67C52',
          champagne: '#E6D7C3'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
