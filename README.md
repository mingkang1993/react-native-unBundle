# react-native-unBundle
```bash
# react native 拆包 0.49.3 拆分2个  一个libs基础包，一个modules包 
node build.js

```


**build.js**

```js
var bundle = require('react-native-unBundle'),
    path = require('path'),
    program = require('commander'),
    fs = require('fs');


function toBool(val){
    try {
        return eval(val);
    }catch (e){

    }
}

function removeFileAll(path) {
    function remove(path,resolve,reject){
        if(fs.existsSync(path)) {
            let files = fs.readdirSync(path);
            files.forEach(function(file, index) {
                const curPath = path + "/" + file;
                fs.statSync(curPath).isDirectory() ? removeFileAll(curPath) : fs.unlinkSync(curPath);       // recurse
            });
            fs.rmdirSync(path);
            resolve(path)
        }else{
            reject(false);
        }
    }

    return new Promise((resolve, reject)=>{
        remove(path,resolve,reject)
    });
};

program
  .version('0.0.1')
    .option('-d, --dev <d>', 'debug', toBool,false )
    .option('-p, --platform <name>', 'Generate environment', 'android')
  .parse(process.argv);




const isIosBundle = program.platform === 'ios';

Promise.resolve()
.then(function () {
  return removeFileAll('build');
})
.then(function () {
  fs.mkdirSync('build');
  isIosBundle && fs.createWriteStream('build/main.jsbundle');
})
.then(function () {
  var path = require('path');
  return bundle(
    {
      dev: program.dev,
      platform: program.platform
    },
    {
      projectRoots: [__dirname]
    },
    {
      entries: `./index.${program.platform}.js`,
      filterEntryFile: function(path){
          var ret = false;

         if(path.indexOf('src') !=-1 && path.indexOf('node_modules') === -1 && path.indexOf(`index.${program.platform}.js`) === -1 && path.indexOf('app.js') === -1){
             ret = true;
         }
         return ret;
      },
      assetsDest: path.join(__dirname, '/build'),
      bundleOutput: function (entry) {
        const packageName = `/libs.${program.platform}.jsbundle`,
              pathJsBundle = isIosBundle ? `/ios${packageName}` : `/android/app/src/main/assets${packageName}`;

        return path.join(__dirname, pathJsBundle)
      },
      moduleBundleOutput: function (entry) {
        var name = 'common';
        if (entry) {
          name = path.basename(path.dirname(entry))
        }
        return path.join(__dirname, `/build/${name}.${program.platform}.jsbundle`)
      }
    }
  )
})
.catch(function (err) {
  console.log(err.stack)
})
