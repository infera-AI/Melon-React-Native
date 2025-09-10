module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],  // 设置根目录为当前目录
        alias: {
          '@': './src',  // 将 @ 映射到 src 目录
        },
      },
    ],
  ],
};
