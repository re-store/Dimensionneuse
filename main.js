var { Board, Proximity, Button } = require("johnny-five");
var db = require('./js/db.js');
var measure = require('./js/measure.js');
var input = require('./js/input.js');

var config = require('./config/config.json');
var materials = require('./config/materials.json');
var types = require('./config/types.json');

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

	console.log('\t\n*** The scanner WILL BE used. ***\n');
	console.log('_____________________________________________________________\n');

	var material = input.material();
	var volume = input.volume();
	var stock = input.stock();

	console.log('_____________________________________________________________\n');


	//THIS IS THE JOHNNY-FIVE CODE SECTION
	var board = new Board();

	board.on('ready',
		function () {
			console.log('\nBOARD READY');

			//THIS IS FOR JOHNNY FIVE TO RECOGNIZE A BUTTON ON PIN 2 (on an arduino); (You may change "2" to the pin of your choice)
			var button = new Button("2");

			//THIS IS FOR JOHNNY FIVE TO RECOGNIZE A GP2Y0A710K0F SENSOR ON PIN A0 (on an arduino);
			//HERE, PUT THE SENSOR YOU ARE USING AND ITS PIN (see all supported sensors here: http://johnny-five.io/api/proximity/)
			sensors.push(new Proximity({
				controller: "HCSR04", //(You may change "HCSR04" to the sensor of your choice)
				pin: "7" //(You may change "7" to the pin of your choice)
			}));


			sensors.push(new Proximity({
				controller: "HCSR04",
				pin: "8"
			}));


			sensors.push(new Proximity({
				controller: "GP2Y0A21YK",
				pin: "A0"
			}));

			button.on("press",
				function () {
					console.log("Measure...");
					measure.start(sensors).then(function (value) {
						console.log("Fin de la mesure. résultat " + value);

					});
				}
			);
		}
	);
}


//THIS IS THE MANUAL MODE, ENABLING YOU TO MEASURE AN OBJECT MANUALLY WITH BETTER PRECISION
function manual() {
	console.log('\t\n*** The scanner WILL NOT BE used. ***\n');
	console.log('_____________________________________________________________');

	var material = ask('\t\n What type of material is being scanned ? \n (Unknown = UKN, Fir = FIR, Pine = PIN, Birch = BIR \n Spruce = SPR, Larch = LAR, Douglas = DOU \n Walnut = WAL, Oak = OAK, Ash = ASH \n Poplar = POP, Alder = ALD, Teak = TEK \n Elm = ELM, Acacia = ACA, Dark acacia = DAC \n Wenge = WEN, Azobe = AZO)',
		['UKN', 'FIR', 'PIN', 'BIR', 'SPR', 'LAR', 'DOU', 'WAL', 'OAK', 'ASH', 'POP', 'ALD', 'TEK', 'ELM', 'ACA', 'DAC', 'WEN', 'AZO']);
	var volume = ask('\t\n What type of volume is being scanned ? \n (Plank = PLAN, Plate = PLAT, Cleat = CLEAT, Undefined = UNDEF) ',
		['PLAN', 'PLAT', 'CLEAT', 'UNDEF']);
	var stock = ask('\t\n Where is the material being scanned ? \n (At Re-Store = RS, at WoMa = WM)',
		['RS', 'WM']);

	console.log('_____________________________________________________________\n');

	var xDim = question('What is the measurement on X ? ');
	var yDim = question('What is the measurement on Y ? ');
	var zDim = question('What is the measurement on Z ? ');

	console.log('_____________________________________________________________\n');

	uploadDb([xDim, yDim, zDim], material, volume, stock);
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
