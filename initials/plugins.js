module.exports = class DemoPlugin {
    constructor(options) {
        this.options = options;
        this.plugin = {name: 'DemoPlugin'}
    }

    apply(compiler) {
        compiler.hooks.beforeRun.tapAsync('DemoPlugin', (compiler, cb) => {
            //console.log('cb', cb);
            //console.log('compiler', compiler);
            compiler.hooks.emit.tapAsync(this.plugin, (compilation, callback) => {
                //console.log('compiler.hooks.emit')
                compilation.modules.forEach(module => {
                    //console.log('compilation.fileDependencies', module._source)
                    //console.log('[--------------------------------------------------]')
                })

                callback()
            })
            cb();
        })
        // compiler.hooks.shouldEmit.tap('DemoPlugin', (compilation => {
        //     console.log('1. --------- should i emit?');
        //
        //     return true;
        // }))
        //
        // compiler.hooks.compilation.tap('DemoPlugin', (compilation, callback) => {
        //     console.log('compilation', compilation.chunk.modules)
        // })
        // compiler.hooks.emit.tapAsync('DemoPlugin', (compilation, callback) => {
        //     console.log('2. --------- Have I reached here?');
        //     try{
        //         compilation.hooks
        //             .additionalChunkAssets
        //             .tap('DemoPlugin', (chunks, callback) => {
        //                 callback();
        //             });
        //     } catch (e){
        //         console.log(e)
        //     }
        //     callback()
        // })
        // compiler.hooks.run.tapAsync('DemoPlugin', (compiler, callback) => {
        //     console.log('Asynchronously tapping the run hook.')
        //     callback()
        // })
    }
};