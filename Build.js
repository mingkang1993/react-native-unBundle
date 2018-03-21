//以后为拆每个模块包做准备
function defaultBuildConcif() {
    return {
        code: [],
        map: {
            mappings: [],
            names: [],
            sources: [],
            sourcesContent: []
        }
    }
}

class Build {
    constructor(buildOuter) {
        this._builds = {
            core: defaultBuildConcif()
        };
        this._buildOuter = buildOuter;
        this._keys = {};
    }

    concat(key, module) {
        const { mappings, names, sources, sourcesContent, code } = module;
        const build = this._builds[key];

        build.code.push(module.code);
        build.map = {
            mappings: build.map.mappings.concat(mappings),
            names: build.map.names.concat(names),
            sources: build.map.sources.concat(sources),
            sourcesContent: build.map.sourcesContent.concat(sourcesContent)
        };

        return this._builds;
    }

    get buildAll() {
        const buildData = {};
        
        for (let key in this._builds){
            let { code, map } = this._builds[key];

            buildData[key] = {
                code: code.join('\n'),
                map: JSON.stringify(map)
            }
        }

        return buildData
    }

    filterBuild(module, outerFilter) {
        for (let params of outerFilter){
            for (let item of params.path) {
                if (module.path.indexOf(item) > -1) {
                    return params.fileName;
                }
            }
        }
    }

    /**
     * @buildOpt {
     *    code: string,
     *    map: {
     *          mappings: array[string],
     *          sources: array[string],
     *          names: array[string],
     *          sourcesContent: array[string]
     *    }    
     * }
     * **/
    buildItem(buildOpt) {
        buildOpt.forEach(module => {
            if (this._keys[module.path]){
                return ;
            }
            this._keys[module.path] = true;
            if (module.path.indexOf('node_modules') > -1) {
                this.concat('core', module);
                return;
            }

            const { outerFilter } = this._buildOuter;
            let outerFindPath = this.filterBuild(module, outerFilter);

            // outerFilter.forEach((params)=>{
            //     params.path.forEach(item => {
            //         if (module.sourcePath.indexOf(item) > -1) {
            //             outerFindPath = params.fileName;
            //         }
            //     }); 
            // });

            if (!outerFindPath){
                this.concat('core', module);
                return;
            }

            if (!this._builds[outerFindPath]) {
                this._builds[outerFindPath] = defaultBuildConcif();
            }
            this.concat(outerFindPath, module);
        });
    }

    /**
     * @startupModules [buildOpt]
     * @lazyModules [buildOpt]
     * **/
    build(buildInfo) {
        this.buildItem(buildInfo);
        // this.buildItem(startupModules);
        // this.buildItem(lazyModules);

        return this._builds;
    }
}

module.exports = (buildOuter) => new Build(buildOuter);
