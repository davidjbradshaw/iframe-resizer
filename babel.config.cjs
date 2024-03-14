module.exports = {
  plugins: ['@babel/plugin-transform-runtime'],
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'last 2 versions',
      },
    ],
    '@babel/preset-react',
  ],
}
