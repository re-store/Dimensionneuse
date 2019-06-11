var config = require('./../config/config.json');

const NB_MEASURE = 200;  // number of measures
const MEASURE_INTERVAL = 20; // ms between 2 measures


exports.start = function(sensors) {
    //Compute the average for NB_MEASURE, for each measure during MEASURE_INTERVAL ms.

    var total = [0, 0, 0];
    var nbMeasures = 0;
    var table = [config.X, config.Y, config.Z];

    return new Promise(function(resolve, _) {
        var measure_interval = setInterval(() => {
            var measure = [sensors[0].cm, sensors[1].cm, sensors[2].cm];
            console.log(measure);
            
            total = addVector3(total, measure);
    
            nbMeasures++;
    
            if (nbMeasures == NB_MEASURE) {
                clearInterval(measure_interval);
                console.log(total);
                
                var measureDone = divVector3(total, NB_MEASURE);
                measureDone = subVector3(table, measureDone);
                console.log(measureDone);
                
                resolve(measureDone);
            }
        }, MEASURE_INTERVAL);
    });
    
}

function addVector3(a, b) {
	// Sends back the sum of tables a and b
	return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function subVector3(a, b) {
	// Sends back the difference of tables a and b
	return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
function divVector3(a, n) {
	// Sends back the division of tables a by n
	return [a[0] / n, a[1] / n, a[2] / n];
}