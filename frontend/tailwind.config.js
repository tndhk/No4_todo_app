/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    darkMode: 'class', // or 'media' for media-query based dark mode
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#4f46e5',
            DEFAULT: '#4338ca',
            dark: '#3730a3',
          },
          secondary: {
            light: '#f9fafb',
            DEFAULT: '#f3f4f6',
            dark: '#e5e7eb',
          },
          // 優先度用の色
          priority: {
            low: '#10b981',    // 緑
            medium: '#f59e0b',  // オレンジ
            high: '#ef4444',   // 赤
          }
        },
      },
    },
    plugins: [],
  }