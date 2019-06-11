var config = require('./../config/config.json');
var materials = require('./../config/materials.json');
var volumes = require('./../config/volumes.json');
var { question } = require("readline-sync");

exports.mode = function () {
	choice = "";
	if (config.askForMode) {
		choice = ask('Would you like to use the scanner mode ? (SCANNER / MANUAL) ', ['SCANNER', 'MANUAL']);
	} else {
		choice = config.defaultMode
	}
	return choice;
}

exports.material = function () {
	choice = "";
	if (config.askForMaterial) {
		var prompt = "\t\n What type of material is being scanned ? (";
		var acceptedAnswers = []
		for (var key in materials) {
			console.log(key);
			prompt += materials[key].name + ": " + materials[key].code + ", ";
			acceptedAnswers.push(materials[key].code);
		}
		prompt += ") ";
		choice = ask(prompt, acceptedAnswers);
	} else {
		choice = config.defaultMaterial
	}
	return choice;
}

exports.volume = function () {
	choice = "";
	if (config.askForVolume) {
		var prompt = "\t\n What type of volume is being scanned ? (";
		var acceptedAnswers = []
		for (var key in volumes) {
			console.log(key);
			prompt += volumes[key].name + ": " + volumes[key].code + ", ";
			acceptedAnswers.push(volumes[key].code);
		}
		prompt += ") ";
		choice = ask(prompt, acceptedAnswers);
	} else {
		choice = config.defaultVolume
	}
	return choice;
}

exports.location = function () {
	return config.defaultLocation
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