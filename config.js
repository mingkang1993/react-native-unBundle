const Terminal = require('metro-core/src/Terminal');
const TerminalReporter = require('metro/src/lib/TerminalReporter');
const TransformCaching = require('metro/src/lib/TransformCaching');
const ConfigT = require('react-native/local-cli/util/Config');
const { ASSET_REGISTRY_PATH } = require('react-native/local-cli/core/Constants');
const { defaults } = require('metro');

const defaultAssetExts = defaults.assetExts;
const defaultSourceExts = defaults.sourceExts;
const defaultPlatforms = defaults.platforms;


function defaultGetBuildOption(args, config) {
    var cwd = args.cwd || process.cwd();
    const terminal = new Terminal(process.stdout);

    return Object.assign({}, ConfigT.DEFAULT, {
        transformCache: TransformCaching.useTempDir(),
        projectRoots: config.projectRoots,
        providesModuleNodeModules: ['react-native', 'react-native-windows'],
        platforms: defaultPlatforms,
        sourceExts: defaultSourceExts,
        assetExts: defaultAssetExts,
        assetRegistryPath: ASSET_REGISTRY_PATH,
        blacklistRE: ConfigT.DEFAULT.getBlacklistRE(),
        transformModulePath: ConfigT.DEFAULT.getTransformModulePath(),
        reporter: new TerminalReporter(terminal),
    })
}

function defaultGetRamBundleInfo() {
    return {
        assetPlugins: [],
        entryModuleOnly: false,
        excludeSource: false,
        hot: false,
        inlineSourceMap: false,
        isolateModuleIDs: true,
        onProgress: null,
        resolutionResponse: null,
        runBeforeMainModule: [],
        runModule: true,
        unbundle: false,

        sourceMapUrl: undefined,
        bundleType: 'ram',
        deltaBundleId: null
    };
}

module.exports = {
    defaultGetBuildOption,
    defaultGetRamBundleInfo
}

