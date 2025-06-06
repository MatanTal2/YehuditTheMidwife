/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Previous, simple extensions can be re-added here if known.
      // For now, keeping it minimal to remove Cursor AI's design system.
      // Example of a common simple extension (if it was there before):
      // backgroundImage: {
      //  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      //  'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      // },
    },
  },
  plugins: [
    // Remove plugins added by Cursor AI:
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
};
