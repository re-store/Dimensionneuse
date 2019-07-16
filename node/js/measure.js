var config = require('./../config/config.json');

/**
 * Computes the average of config.measuresNb, for each measure during config.measureInterval ms.
 * Returns a promise which resolves when measures are finished.
 */
exports.start = function(sensors) {

    var total = [0, 0, 0];
    var nbMeasures = 0;
    var table = [config.X, config.Y, config.Z];

    return new Promise(function(resolve, _) {
        var measure_interval = setInterval(() => {
            var measure = [sensors[0].cm, sensors[1].cm, sensors[2].cm];
            
            total = addVector3(total, measure);
            console.log(measure);
            

            nbMeasures++;

            if (nbMeasures == config.measuresNb) {
                clearInterval(measure_interval);
                var measureDone = divVector3(total, nbMeasures);
                resolve(measureDone);
            }
        }, config.measureInterval);
    });
    
}

/**
 * Computes the sum of tables a and b.
 */
function addVector3(a, b) {
	return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * Computes the difference of tables a and b.
 */
function subVector3(a, b) {
	return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

/**
 * Computes the division of tables a by n.
 */
function divVector3(a, n) {
	return [a[0] / n, a[1] / n, a[2] / n];
}