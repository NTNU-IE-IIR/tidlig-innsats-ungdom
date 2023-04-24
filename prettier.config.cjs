/** @type {import("prettier").Config} */
const config = {
  tabWidth: 2,
  singleQuote: true,
  jsxSingleQuote: true,
  bracketSameLine: false,
  semi: true,
  trailingComma: 'es5',
  plugins: [require.resolve('prettier-plugin-tailwindcss')],
};

module.exports = config;
