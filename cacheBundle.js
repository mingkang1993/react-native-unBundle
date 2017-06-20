var Bundle = require('react-native/packager/src/Bundler/Bundle');


//以后为拆每个模块包做准备
class CacheBuild {
    constructor() {
        this._builds = {};
    }

    getBuild (key){
        return this._builds[key];
    }

    set addBuild (key){
        this._builds[key] = new Bundle();

        return this._builds;
    }

    setBuild (key,data){
        const item = this._builds[key];
        this._builds[key]._modules.push(data);

        return this._builds[key];
    }

    get allBuilds (){
        return this._builds;
    }
}

module.exports = new CacheBuild();
