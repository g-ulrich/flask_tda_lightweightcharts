/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
      colors: {
        discordPurple: '#7289da',
        discordDarkGray: '#424549',
        discordGray: '#36393e',
        discordDarkerGray: '#282b30',
        discordAlmostBlack: '#1e2124'
      },
    },
  },
  plugins: [],
}