'use strict'

// require('react-native/packager/babelRegisterOnly')([
//     /private-cli\/src/,
//     /local-cli/,
// ])
require('react-native/setupBabel')();
var debug = require('react-native/local-cli/util/log').out('bundle');
var path = require('path');
var saveAssets = require('react-native/local-cli/bundle/saveAssets');
var CacheBundle = require('./cacheBundle.js');
var Server = require('metro-bundler/src/Server');
var outputBundle = require('metro-bundler/src/shared/output/bundle');
const TransformCaching = require('metro-bundler/src/lib/TransformCaching');
const ConfigT = require('react-native/local-cli/util/Config');
const Terminal = require('metro-bundler/src/lib/Terminal');
const TerminalReporter = require('metro-bundler/src/lib/TerminalReporter');

function createCodeWithMap(bundle, dev) {
    return {
        code: bundle.getSource({dev}),
        map: JSON.stringify(bundle.getSourceMap({dev})),
    };
}

const bundleOptions = {
    entryModuleOnly: false,
    generateSourceMaps: false,
    hot: false,
    inlineSourceMap: false,
    isolateModuleIDs: false,
    onProgress: null,
    resolutionResponse: null,
    runBeforeMainModule: [ 'InitializeCore' ],
    runModule: true,
    sourceMapUrl: null,
    unbundle: false,
    isolateModuleIDs: true
};


module.exports = function (args, config, bundleOptions) {
    var cwd = args.cwd || process.cwd();
    debug('start');
    const terminal = new Terminal(process.stdout);

    const packagerInstance = new Server(Object.assign({},ConfigT.DEFAULTS,{
        transformCache: TransformCaching.useTempDir(),
        projectRoots: config.projectRoots,
        blacklistRE: require('metro-bundler/src/blacklist')(),
        transformModulePath: require.resolve('metro-bundler/src/transformer'),
        reporter: new TerminalReporter(terminal)
    }));

    const getClient = packagerInstance.buildBundle(Object.assign({},Server.DEFAULT_BUNDLE_OPTIONS,{
        entryFile: bundleOptions.entries,
        dev: args.dev,
        minify: !args.dev,
        platform: args.platform,
        isolateModuleIDs: true
    })).then(function (bundles) {
        debug('start Bundles');
        const getModules = bundles.getModules();
        const mapFilterPath = {},
            mapLibsFilterPath = {};

        CacheBundle.addBuild = 'libsBundle';
        CacheBundle.addBuild = 'newBundle';

        getModules.forEach(function(module) {

            if(bundleOptions.filterEntryFile && bundleOptions.filterEntryFile(module.sourcePath)){
                if(!mapFilterPath[module.sourcePath]){
                    mapFilterPath[module.sourcePath] = true;
                    CacheBundle.setBuild('newBundle',module);
                }
            }else{
                if(!mapLibsFilterPath[module.sourcePath]){
                    mapLibsFilterPath[module.sourcePath] = true;
                    CacheBundle.setBuild('libsBundle',module);
                }
            }
        });

        const newBundle = CacheBundle.getBuild('newBundle'),
            libsBundle = CacheBundle.getBuild('libsBundle');

        libsBundle.finalize();
        newBundle.finalize();

        return {
            bundles,
            outBundles: {
                moduleBundle: newBundle,
                bundle: libsBundle
            }
        }
    }).then(function (bundles) {
        debug('Final Bundles');
        const outputBundles = [];

        const bopts = Object.create(args),
            { outBundles } = bundles;

        for(let key in outBundles){
            const bundle = outBundles[key];

//             (function(bundle){
            outputBundles.push(outputBundle.save(bundle, Object.assign(bopts,{
                bundleOutput: bundleOptions[key + 'Output'](bundle._entry)
            }), debug));
//             })(outBundles[key]);
        }

        return {
            bundles: bundles.bundles,
            allOutputBundles: Promise.all(outputBundles)
        }
    })
    .then(function (mainBundles) {

        debug('saveAssets')
        mainBundles.allOutputBundles.then(()=>{
            saveAssets(mainBundles.bundles.getAssets(),args.platform,bundleOptions.assetsDest).then(()=>{
                    debug('Closing client')
                process.exit();
            })
        })
    })
}

