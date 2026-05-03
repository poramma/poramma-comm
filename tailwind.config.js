// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Mode sombre activé via .dark
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ECF9F0',
          100: '#CFF0DB',
          300: '#5FC389',
          500: '#007A3D',
          700: '#00572C',
        },
        gold: {
          50: '#FFF9EB',
          300: '#FFD66A',
          500: '#FFCB05',
          700: '#E6B400',
        },
        accent: {
          50: '#FFEDEE',
          300: '#FF7A78',
          500: '#D62828',
          700: '#A52121',
        },
        neutral: {
          50: '#FBFBFD',
          100: '#F3F4F6',
          300: '#E5E7EB',
          500: '#6B7280',
          700: '#111827',
        },
        success: '#16A34A',
        info: '#0284C7',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
