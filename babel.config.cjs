module.exports = {
  plugins: ['@babel/plugin-transform-runtime'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: [
          'last 4 versions',
          'Safari > 15',
          'not dead',
          'not < 0.25%',
          'not ie 6-11',
        ],
      },
    ],
    '@babel/preset-react',
  ],
}
