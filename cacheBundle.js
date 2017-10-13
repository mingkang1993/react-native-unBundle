var Bundle = require('metro-bundler/src/Bundler/Bundle');
const ConfigT = require('react-native/local-cli/util/Config');

//以后为拆每个模块包做准备
class CacheBuild {
    constructor() {
        this._builds = {};
    }

    getBuild (key){
        return this._builds[key];
    }

    set addBuild (key){
        this._builds[key] = new Bundle(ConfigT.DEFAULTS);

        return this._builds;
    }

    setBuild (key,data){
        const item = this._builds[key];
        // this._builds[key].__modules.push(data);
        item.__proto__.__proto__.addModule.call(item,data);

        return this._builds[key];
    }

    get allBuilds (){
        return this._builds;
    }
}

module.exports = new CacheBuild();
