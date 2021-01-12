const devPresets = ['@vue/babel-preset-app', "@babel/preset-typescript"];
const buildPresets = ['@babel/preset-env', "@babel/preset-typescript"];
module.exports = {
  presets: (process.env.NODE_ENV === 'development' ? devPresets : buildPresets),
};
