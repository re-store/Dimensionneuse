var { Board, Proximity, Button } = require("johnny-five");
var db = require('./js/db.js');
var measure = require('./js/measure.js');
var input = require('./js/input.js');

var config = require('./config/config.json');
var sensorsInfo = require('./config/sensors.json');

var userMode = '';
var sensors = [];

// Boot

console.log('_____________________________________________________________\n');
console.log('\n|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||');
console.log('        ======== La Dimensionneuse - v1.0.0 ========');
console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n');


console.log('_____________________________________________________________\n');
console.log('Hello and welcome !\n');
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

	console.log('\n\t*** The scanner WILL BE used. ***\n');
	console.log('_____________________________________________________________\n');

	var material = input.material();
	var volume = input.volume();
	var location = input.location();
	console.log('\tMaterial: ' + material);
	console.log('\tVolume: ' + volume);
	console.log('\tLocation: ' + location);

	console.log('_____________________________________________________________\n');


	//THIS IS THE JOHNNY-FIVE CODE SECTION
	var board = new Board();

	board.on('ready',
		function () {
			// Button & sensors init
			for (var sensor in sensorsInfo) {
				sensors.push(new Proximity({
					controller: sensorsInfo[sensor].controller,
					pin: sensorsInfo[sensor].pin
				}));
			}
			
			var button = new Button(config.buttonPin);
			button.on("press", buttonPress);

			console.log('\nBOARD READY');
		}
	);
}

/**
 * Called when the button is clicked.
 */
function buttonPress() {
	console.log("Measure...");
	measure.start(sensors).then(function (value) {
		console.log("\t=>" + value[0]);
	});
}

//THIS IS THE MANUAL MODE, ENABLING YOU TO MEASURE AN OBJECT MANUALLY WITH BETTER PRECISION
function manual() {
	console.log('\n\t*** The scanner WILL NOT BE used. ***\n');
	console.log('_____________________________________________________________');

	var material = ask('\n\t What type of material is being scanned ? \n (Unknown = UKN, Fir = FIR, Pine = PIN, Birch = BIR \n Spruce = SPR, Larch = LAR, Douglas = DOU \n Walnut = WAL, Oak = OAK, Ash = ASH \n Poplar = POP, Alder = ALD, Teak = TEK \n Elm = ELM, Acacia = ACA, Dark acacia = DAC \n Wenge = WEN, Azobe = AZO)',
		['UKN', 'FIR', 'PIN', 'BIR', 'SPR', 'LAR', 'DOU', 'WAL', 'OAK', 'ASH', 'POP', 'ALD', 'TEK', 'ELM', 'ACA', 'DAC', 'WEN', 'AZO']);
	var volume = ask('\n\t What type of volume is being scanned ? \n (Plank = PLAN, Plate = PLAT, Cleat = CLEAT, Undefined = UNDEF) ',
		['PLAN', 'PLAT', 'CLEAT', 'UNDEF']);
	var location = ask('\n\t Where is the material being scanned ? \n (At Re-Store = RS, at WoMa = WM)',
		['RS', 'WM']);

	console.log('_____________________________________________________________\n');

	var xDim = question('What is the measurement on X ? ');
	var yDim = question('What is the measurement on Y ? ');
	var zDim = question('What is the measurement on Z ? ');

	console.log('_____________________________________________________________\n');

	uploadDb([xDim, yDim, zDim], material, volume, location);
}



///////////////////////////////////////////////////
//FUNCTIONS FOR AUTO MEASURES//
///////////////////////////////////////////////////



///////////////////////////////////////////////////
//FUNCTIONS FOR UPLOAD DB POSTGRESQL//
///////////////////////////////////////////////////



///////////////////////////////////////////////////
//UTIL FUNCTIONS//
///////////////////////////////////////////////////




function afterUpload() {
	var continueMeasure = ask('Would you like to do an other measure ? (Y / N)', ['Y', 'N']);
	if (continueMeasure == 'Y') {
		main();
	} else if (continueMeasure == 'N') {
		process.exit(0);
	}
}
