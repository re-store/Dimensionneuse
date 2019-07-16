var config = require('./../config/config.json');

exports.upload = function(measure, material, volume, stock) {
    return new Promise(function(resolve, _) {
        // console.log([config.X - measure[0], config.Y - measure[1], config.Z - measure[2]]);
        console.log(measure[0]);
        resolve();
    });
}
