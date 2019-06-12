var { Board, Proximity, Button } = require("johnny-five");
var { question } = require("readline-sync");

var db = require('./js/db.js');
var measure = require('./js/measure.js');
var input = require('./js/input.js');

var config = require('./config/config.json');
var sensorsInfo = require('./config/sensors.json');

var userMode = '';
var sensors = [];
var parameters = {};
var isBoardInit = false;
var canClick = true;

// Boot
console.log('=================================');
console.log('======= La Dimensionneuse =======');
console.log('=================================');
console.log('Welcome !');
main();

/**
 * Main function.
 * Asks the user which mode to use if config.askForMode is set to true.
 */
function main() {
	userMode = input.mode();

	if (userMode == 'SCANNER') {
		auto();
	} else if (userMode == 'MANUAL') {
		manual();
	}
}


/**
 * Automatic mode.
 */
function auto() {

	console.log('\nUsing automatic mode:');

	// Parameters input
	parameters.material = input.material();
	parameters.volume = input.volume();
	parameters.location = input.location();
	showParameters();

	if (!isBoardInit) {
		boardInit();
	} else {
		canClick = true;
		console.log("Press the button to measure.");
		
	}
}

/**
 * Manual mode.
 */
function manual() {
	console.log('\nUsing manual mode:');

	// Parameters input
	parameters.material = input.material();
	parameters.volume = input.volume();
	parameters.location = input.location();
	showParameters();

	// Size input
	var size = input.size();

	// Upload
	afterMeasure(size);
}

/**
 * Called after a manual or automatic measure.
 */
function afterMeasure(m) {
	db.upload(m, parameters.material, parameters.volume, parameters.location).then(function(_) {
		var continueMeasure = input.continue();
		if (continueMeasure == 'Y') {
			main();
		} else if (continueMeasure == 'N') {
			process.exit(0);
		}
	});
}

/**
 * Called when first using automatic mode.
 */
function boardInit() {
	var board = new Board();
	board.on('ready',
		function () {
			// Sensors init
			for (var sensor in sensorsInfo) {
				sensors.push(new Proximity({
					controller: sensorsInfo[sensor].controller,
					pin: sensorsInfo[sensor].pin
				}));
			}

			// Button init
			var button = new Button(config.buttonPin);
			button.on("press", buttonPress);

			console.log('The board is ready.\nPress the button to measure.\n');
			isBoardInit = true;
		}
	);
}

/**
 * Called when the button is clicked.
 */
function buttonPress() {
	if (canClick) {
		canClick = false;
		console.log("Measuring...");
	
		// Start measuring
		measure
			.start(sensors)
			.then(function (value) {
				afterMeasure(value);
			});
	}
}

function showParameters() {
	console.log("\nChosen parameters:");
	
	console.log('- Material: ' + parameters.material);
	console.log('- Volume: ' + parameters.volume);
	console.log('- Location: ' + parameters.location);
}