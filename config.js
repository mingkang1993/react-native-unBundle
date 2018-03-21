const Terminal = require('metro-core/src/Terminal');
const TerminalReporter = require('metro/src/lib/TerminalReporter');
const TransformCaching = require('metro/src/lib/TransformCaching');
let ConfigT = require('react-native/local-cli/util/Config');
const { ASSET_REGISTRY_PATH } = require('react-native/local-cli/core/Constants');
const { defaults } = require('metro');
let { Config } = require('metro');
const defaultAssetExts = defaults.assetExts;
const defaultSourceExts = defaults.sourceExts;
const defaultPlatforms = defaults.platforms;
ConfigT = ConfigT.DEFAULT;
Config = Config.DEFAULT;


function defaultGetBuildOption(args, config) {
    var cwd = args.cwd || process.cwd();
    const terminal = new Terminal(process.stdout);
    process.env.NODE_ENV = args.dev ? 'development' : 'production';

    // return { 
    //     assetExts: defaultAssetExts,
    //     assetRegistryPath: ASSET_REGISTRY_PATH,
    //     blacklistRE: Config.getBlacklistRE(),
    //     extraNodeModules: Config.extraNodeModules,
    //     transformCache: TransformCaching.useTempDir(),
    //     getModulesRunBeforeMainModule: Config.getModulesRunBeforeMainModule,
    //     getPolyfills: Config.getPolyfills,
    //     getTransformOptions: Config.getTransformOptions,
    //     globalTransformCache: null,
    //     hasteImpl: Config.hasteImpl,
    //     maxWorkers: undefined,
    //     platforms: ['ios', 'android', 'windows', 'web'],
    //     postMinifyProcess: Config.postMinifyProcess,
    //     postProcessModules: Config.postProcessModules,
    //     postProcessBundleSourcemap: Config.postProcessBundleSourcemap,
    //     projectRoots: config.projectRoots,
    //     providesModuleNodeModules: Config.getProvidesModuleNodeModules(),
    //     resetCache: undefined,
    //     reporter: new TerminalReporter(terminal),
    //     sourceExts: defaultSourceExts,
    //     transformCache: TransformCaching.useTempDir(),
    //     transformModulePath: Config.getTransformModulePath(),
    //     watch: false,
    //     workerPath: null,
    // }

    return Object.assign(Config, ConfigT, {
        transformCache: TransformCaching.useTempDir(),
        projectRoots: config.projectRoots,
        providesModuleNodeModules: ['react-native', 'react-native-windows'],
        platforms: defaultPlatforms,
        sourceExts: defaultSourceExts,
        assetExts: defaultAssetExts,
        assetRegistryPath: ASSET_REGISTRY_PATH,
        blacklistRE: ConfigT.getBlacklistRE(),
        transformModulePath: ConfigT.getTransformModulePath(),
        reporter: new TerminalReporter(terminal),
        globalTransformCache: null,
        workerPath: null,
        watch: false,
        dynamicDepsInPackages: null
    })
}

function defaultGetRamBundleInfo(opt) {
    return Object.assign({
        assetPlugins: [],
        entryModuleOnly: false,
        excludeSource: false,
        hot: false,
        inlineSourceMap: false,
        isolateModuleIDs: true,
        onProgress: null,
        resolutionResponse: null,
        runBeforeMainModule: Config.getModulesRunBeforeMainModule(opt.entryFile),
        runModule: true,
        unbundle: false,
        dev: false,
        sourceMapUrl: undefined,
        bundleType: 'bundle',
        deltaBundleId: null
    }, opt);
}

module.exports = {
    defaultGetBuildOption,
    defaultGetRamBundleInfo
}

