module.exports = class DemoPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.plugin("emit", (compilation, cb) => {
      console.log(compilation);

      cb();
    });
  }
};