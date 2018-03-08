'use strict'
require('metro/src/babelRegisterOnly')([
    /private-cli\/src/,
    /local-cli/,
    /Libraries/
])
require('react-native/setupBabel')();
const debug = require('react-native/local-cli/util/log').out('bundle');
const saveAssets = require('react-native/local-cli/bundle/saveAssets');
const Server = require('metro/src/Server');
const outputBundle = require('metro/src/shared/output/bundle');
const Serializers = require('metro/src/DeltaBundler/Serializers');
const { defaultGetBuildOption, defaultGetRamBundleInfo } = require('./config');
const unBuild = require('./Build');


function getBuildInfo(args, config, bundleOptions) {
    debug('start');

    const packagerInstance = new Server(
        defaultGetBuildOption(args, config)
    );

    const buildInfo = Serializers.getRamBundleInfo(
        packagerInstance.getDeltaBundler(),
        Object.assign(defaultGetRamBundleInfo(), {
            entryFile: bundleOptions.entries,
            dev: args.dev,
            minify: !args.dev,
            platform: args.platform,
        })
    );
    
    return {
        packagerInstance,
        buildInfo
    };
}

function getUnBuildInfo(buildInfo, bundleOptions) {
    debug('start Bundles');
    const unBuildFn = unBuild(bundleOptions);
    
    unBuildFn.build(buildInfo.startupModules, buildInfo.lazyModules);

    return unBuildFn.buildAll;
}

function save(unBuildInfo, args){
    debug('Final Bundles');
    const bopts = Object.create(args);
    const outputBundles = [];

    for (let key in unBuildInfo) {
        (function (itemBuild, key) {
            outputBundles.push(
                outputBundle.save(itemBuild, Object.assign(bopts, {
                    bundleOutput: 'build/' + key + '.jsbundle'
                }), debug)
            );
        })(unBuildInfo[key], key);
    }

    return Promise.all(outputBundles);
}

function buildSaveAssets(saveBuild, packagerInstance, args, bundleOptions){
    debug('saveAssets')

    saveBuild.then(() => {
        saveAssets(packagerInstance.getAssets(), args.platform, bundleOptions.assetsDest).then(() => {
            debug('Closing client')
            process.exit();
        })
    })
}

async function build(args, config, bundleOptions){
    const { buildInfo, packagerInstance } = getBuildInfo(args, config, bundleOptions);
    const unBuildInfo = getUnBuildInfo(await buildInfo, bundleOptions);
    const saveBuild = save(unBuildInfo, args);

    buildSaveAssets(saveBuild, packagerInstance, args, bundleOptions)
}

module.exports = build;























// module.exports = function (args, config, bundleOptions) {
//     debug('start');
//     getBuildOption = getBuildOptionFn(args, config);
//     const packagerInstance = new Server(getBuildOption);
//     const getDeltaBundler = packagerInstance.getDeltaBundler();

//     Serializers.getRamBundleInfo(getDeltaBundler, {
//         assetPlugins: [],
//         entryModuleOnly: false,
//         excludeSource: false,
//         hot: false,
//         inlineSourceMap: false,
//         isolateModuleIDs: true,
//         onProgress: null,
//         resolutionResponse: null,
//         runBeforeMainModule: [],
//         runModule: true,
//         unbundle: false,

//         entryFile: bundleOptions.entries,
//         dev: args.dev,
//         minify: !args.dev,
//         platform: args.platform,
//         sourceMapUrl: undefined,
//         bundleType: 'ram',
//         deltaBundleId: null
//     })
//     .then(function (bundles) {
//         debug('start Bundles');
//         const unBuildFn = unBuild(bundleOptions);

//         unBuildFn.build(bundles.startupModules, bundles.lazyModules);

//         return unBuildFn.buildAll;
//         // const mapFilterModule= {
//         //         code: [],
//         //         map: {
//         //             mappings: [],
//         //             names: [],
//         //             sources: [],
//         //             sourcesContent: [],
//         //             version: 3
//         //         }
//         //     },
//         //     mapLibsFilterModule = {
//         //         code: [],
//         //         map: {
//         //             mappings: [],
//         //             names: [],
//         //             sources: [],
//         //             sourcesContent: [],
//         //             version: 3
//         //         }
//         //     };
//         // const mapFilterPath = {},
//         //       mapLibsFilterPath = {};
//         // bundles.startupModules.forEach(module => {
//         //     mapLibsFilterModule.code.push(module.code);

//         //     mapLibsFilterModule.map.mappings = mapLibsFilterModule.map.mappings.concat(module.map.mappings);
//         //     mapLibsFilterModule.map.names = mapLibsFilterModule.map.names.concat(module.map.names);
//         //     mapLibsFilterModule.map.sources = mapLibsFilterModule.map.sources.concat(module.map.sources);
//         //     mapLibsFilterModule.map.sourcesContent = mapLibsFilterModule.map.sourcesContent.concat(module.map.sourcesContent);
//         // });
//         // bundles.lazyModules.forEach(function(module,index) {
//         //     if(bundleOptions.filterEntryFile && bundleOptions.filterEntryFile(module.sourcePath)){
//         //         if(!mapFilterPath[module.sourcePath]){
//         //             mapFilterPath[module.sourcePath] = true;
//         //             mapFilterModule.code.push(module.code);

//         //             mapFilterModule.map.mappings = mapFilterModule.map.mappings.concat(module.map.mappings);
//         //             mapFilterModule.map.names = mapFilterModule.map.names.concat(module.map.names);
//         //             mapFilterModule.map.sources = mapFilterModule.map.sources.concat(module.map.sources);
//         //             mapFilterModule.map.sourcesContent = mapFilterModule.map.sourcesContent.concat(module.map.sourcesContent);
//         //         }
//         //     }else{
//         //         if(!mapLibsFilterPath[module.sourcePath]){
//         //             mapLibsFilterPath[module.sourcePath] = true;

//         //             mapLibsFilterModule.code.push(module.code);
//         //             mapLibsFilterModule.map.mappings = mapLibsFilterModule.map.mappings.concat(module.map.mappings);
//         //             mapLibsFilterModule.map.names = mapLibsFilterModule.map.names.concat(module.map.names);
//         //             mapLibsFilterModule.map.sources = mapLibsFilterModule.map.sources.concat(module.map.sources);
//         //             mapLibsFilterModule.map.sourcesContent = mapLibsFilterModule.map.sourcesContent.concat(module.map.sourcesContent);
//         //         }
//         //     }
//         // });
//         // mapLibsFilterModule.code = mapLibsFilterModule.code.join('\n');
//         // mapLibsFilterModule.map = JSON.stringify(mapLibsFilterModule.map);

//         // mapFilterModule.code = mapFilterModule.code.join('\n');
//         // mapFilterModule.map = JSON.stringify(mapFilterModule.map);







//         // fs.writeFile('./wfile.txt', JSON.stringify(mapLibsFilterModule), { flag: 'w', encoding: 'utf-8', mode: '0666' }, function (err) {
//         //     if (err) {
//         //         console.log("文件写入失败")
//         //     } else {
//         //         console.log("文件写入成功");

//         //     }
//         // }) 

        
//         // return {
//         //     moduleBundle: mapFilterModule,
//         //     bundle: mapLibsFilterModule,
//         // }
//     }).then(function (bundles) {
//         debug('Final Bundles');
//         const bopts = Object.create(args);
//         const outputBundles = [];

//         for (let key in bundles) {
//             outputBundles.push(
//                 outputBundle.save(bundles[key], Object.assign(bopts, {
//                     bundleOutput: 'build/' + key + '.jsbundle'
//                 }), debug)
//             );
//         }


// //         for(let key in outBundles){
// //             const bundle = outBundles[key];
// // //             (function(bundle){
// //             outputBundles.push(outputBundle.save(bundle, Object.assign(bopts,{
// //                 bundleOutput: bundleOptions[key + 'Output'](bundle._entry)
// //             }), debug));
// // //             })(outBundles[key]);
// //         }

//         return {
//             bundles: bundles.bundles,
//             allOutputBundles: Promise.all(outputBundles)
//         }
//     })
//     .then(function (mainBundles) {
//         debug('saveAssets')
//         mainBundles.allOutputBundles.then(()=>{
//             saveAssets(mainBundles.bundles.getAssets(),args.platform,bundleOptions.assetsDest).then(()=>{
//                     debug('Closing client')
//                 process.exit();
//             })
//         })
//     })
// }

