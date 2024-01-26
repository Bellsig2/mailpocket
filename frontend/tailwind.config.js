/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
   './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        customPurple: '#8F20FF',
        darkgray: '#a9a9a9',
        lightgrey : '#d3d3d3',
        subscribecolor: '#8f20ffb5',
        whitesmoke : '#f5f5f5'
      },
      maxWidth: {
        '900': '900px',
      },
    },
    screens: {
      md: { max: '768px' },
    },
  },
  plugins: [],
}
