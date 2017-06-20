'use strict'

require('react-native/packager/babelRegisterOnly')([
    /private-cli\/src/,
    /local-cli/,
])
require('react-native/setupBabel')();
var Bundle = require('react-native/packager/src/Bundler/Bundle.js');
var debug = require('react-native/local-cli/util/log').out('bundle');
var path = require('path');
var ReactPackager = require('react-native/packager/react-packager');
var saveAssets = require('react-native/local-cli/bundle/saveAssets');
var CacheBundle = require('./cacheBundle.js');
var Server = require('react-native/packager/src/Server');
var outputBundle = require('react-native/local-cli/bundle/output/bundle');

function createCodeWithMap(bundle, dev) {
    return {
        code: bundle.getSource({dev}),
        map: JSON.stringify(bundle.getSourceMap({dev})),
    };
}



//function build(entryFile,args, config, bundleOptions){
//    const cwd = args.cwd || process.cwd();
//
//    return ReactPackager.buildBundle({
//        projectRoots: config.projectRoots,
//        blacklistRE: config.blacklistRE,
//        transformModulePath: args.transformer,
//        verbose: args.verbose,
//        //projectRoots: config.getProjectRoots(),
//        //assetRoots: config.getAssetRoots(),
//        //blacklistRE: config.getBlacklistRE(),
//        //getTransformOptionsModulePath: config.getTransformOptionsModulePath,
//      },{
//        entryFile: path.resolve(cwd,entryFile),
//        sourceMapUrl: args['sourcemap-output'],
//        dev: args.dev,
//        minify: !args.dev,
//        platform: args.platform,
//      }).then(function (c) {
//        debug('Created ReactPackager');
//        return c
//      }).then(function (bundles) {
//        var a = bundles.getModules();
//        var newBundle = new Bundle();
//
//        for(var i in a){
//            a.forEach(function(module) {
//                if(filter(module.sourcePath)){
//                    newBundle._modules.push(module);
//                }
//            })
//        }
//        newBundle.finalize();
//        return {
//            bundle: [bundles],
//            moduleBundle: [newBundle]
//        }
//      })
//      .then(function (bundles) {
//        debug('Final Bundles', bundles.length);
//
//        bundles.forEach(function (bundle) {
//          var bopts = Object.create(args)
//          bopts['bundle-output'] = bundleOptions.entries(bundle._entry);
//          outputBundle.save(bundle, bopts, debug)
//        })
//
//        return bundles
//      })
//      .then(function (bundles) {
//        debug('Assets')
//        return Promise.all(
//          bundles.map(function (bundle) {
//            return saveAssets(bundle.getAssets(), args.platform, args['assets-dest'])
//          })
//        )
//      })
//}


//        outputBundle.build(packagerInstance, {
//            entryFile: path.resolve(cwd,bundleOptions.entries[0]),
//            dev: args.dev,
//            minify: !args.dev,
//            platform: args.platform
//        }).then(bundles => {
//                           var bopts = Object.create(args);
//
//                     debug('Final Bundles', bundles.length);
//
//           bopts['bundleOutput'] = bundleOptions['bundleOutput']('1111');
//           console.log(bopts)
//
//           outputBundle.save(bundles, bopts, debug);


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

    const packagerInstance = new Server({
        projectRoots: config.projectRoots,
        blacklistRE: config.blacklistRE,
        transformModulePath: args.transformer,
        reporter:{
            update:function(a){
                console.log(a)
            }
        }
    });

    const getClient = packagerInstance.buildBundle(Object.assign(bundleOptions,{
        entryFile: bundleOptions.entries,
        dev: args.dev,
        minify: !args.dev,
        platform: args.platform
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



////  process.env.NODE_ENV = args.dev ? 'development' : 'production';
//  var getClient = ReactPackager.getOrderedDependencyPaths({
//    projectRoots: config.projectRoots,
//    blacklistRE: config.blacklistRE,
//    transformModulePath: args.transformer,
//    verbose: args.verbose
//    //projectRoots: config.getProjectRoots(),
//    //assetRoots: config.getAssetRoots(),
//    //blacklistRE: config.getBlacklistRE(),
//    //getTransformOptionsModulePath: config.getTransformOptionsModulePath,
//  },{
//    entryFile: path.resolve(cwd,bundleOptions.entries[0]),
//    dev: args.dev,
//    minify: !args.dev,
//    platform: args.platform,
//  }).then(function (c) {
////  console.log(c)
//    debug('Created ReactPackager');
//    return c
//  }).then(function (bundles) {
////    var a = bundles.getModules();
//    var newBundle = new Bundle();
//    var libsBundle = new Bundle();
//
//    var mapFilterPath = [],
//        mapLibsFilterPath = [];
//                console.log()
//
//    bundles.forEach(function(module) {
//    console.log(module)
//        config.projectRoots.filter((root)=>{
//            console.log(module.startsWith(root))
//        })
//
////        if(filter(module.sourcePath,bundleOptions.filterEntryFile)){
////            if(mapFilterPath.indexOf(module.sourcePath) === -1){
////                mapFilterPath.push(module.sourcePath);
////                newBundle._modules.push(module);
////            }
////        }else{
////            if(mapLibsFilterPath.indexOf(module.sourcePath) === -1){
////                mapLibsFilterPath.push(module.sourcePath);
////                libsBundle._modules.push(module);
////            }
////        }
//    });
//
//    libsBundle.finalize();
//    newBundle.finalize();
//
//    return {
//        moduleBundle: [newBundle],
//        bundle: [libsBundle]
//    }
//  })
//  .then(function (bundles) {
//    debug('Final Bundles', bundles.length);
//
//    for(let key in bundles){
//        bundles[key].forEach(function (bundle) {
//          var bopts = Object.create(args);
//          bopts['bundle-output'] = bundleOptions[key + 'Output'](bundle._entry);
//
//          outputBundle.save(bundle, bopts, debug)
//        })
//    }
//
//    return bundles
//  })
//  .then(function (bundles) {
////    debug('Assets')
////    return Promise.all(
////      bundles.moduleBundle.map(function (bundle) {
////        return saveAssets(bundle.getAssets(), args.platform, args['assets-dest'])
////      })
////    )
//  })
//  .then(function () {
//    debug('Closing client')
////    getClient.then(function (client) {
////      mapFilterPath = [];
////      client.close();
////    })
//  })

