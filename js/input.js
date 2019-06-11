var config = require('./../config/config.json');
var { question } = require("readline-sync");

exports.mode = function() {
    choice = "";
    if (config.askForMode) {
		choice = ask('Would you like to use the scanner mode ? (SCANNER / MANUAL) ', ['SCANNER', 'MANUAL']);
	} else {
		choice = config.defaultMode
    }
    return choice;
}

exports.material = function() {
    ask('\t\n What type of material is being scanned ? \n (Unknown = UKN, Fir = FIR, Pine = PIN, Birch = BIR \n Spruce = SPR, Larch = LAR, Douglas = DOU \n Walnut = WAL, Oak = OAK, Ash = ASH \n Poplar = POP, Alder = ALD, Teak = TEK \n Elm = ELM, Acacia = ACA, Dark acacia = DAC \n Wenge = WEN, Azobe = AZO)',
		['UKN', 'FIR', 'PIN', 'BIR', 'SPR', 'LAR', 'DOU', 'WAL', 'OAK', 'ASH', 'POP', 'ALD', 'TEK', 'ELM', 'ACA', 'DAC', 'WEN', 'AZO']);
}

exports.volume = function() {
    ask('\t\n What type of volume is being scanned ? \n (Plank = PLAN, Plate = PLAT, Cleat = CLEAT, Undefined = UNDEF) ',
		['PLAN', 'PLAT', 'CLEAT', 'UNDEF']);
}

exports.stock = function() {
    ask('\t\n Where is the material being scanned ? \n (At Re-Store = RS, at WoMa = WM)',
		['RS', 'WM']);
}

function ask(prompt, accepted) {
	var input = "";
	do {
		input = question(prompt);
		if (!accepted.includes(input))
			console.log('\tI did not catch that :/')
	} while (!accepted.includes(input));
	return input
}