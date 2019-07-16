var config = require('./../config/config.json');
var materials = require('./../config/materials.json');
var volumes = require('./../config/volumes.json');
var { question } = require("readline-sync");

exports.mode = function () {
    var choice = "";
    if (config.askForMode) {
        choice = ask('Would you like to use the scanner mode ? (SCANNER / MANUAL) ', ['SCANNER', 'MANUAL']);
    } else {
        choice = config.defaultMode;
    }
    return choice;
}

exports.material = function () {
    var choice = "";
    if (config.askForMaterial) {
        var prompt = "What type of material is being scanned ? (";
        var acceptedAnswers = [];
        for (var key in materials) {
            prompt += materials[key].name + ": " + materials[key].code + ", ";
            acceptedAnswers.push(materials[key].code);
        }
        prompt += ") ";
        choice = ask(prompt, acceptedAnswers);
    } else {
        choice = config.defaultMaterial;
    }
    return choice;
}

exports.volume = function () {
    var choice = "";
    if (config.askForVolume) {
        var prompt = "What type of volume is being scanned ? (";
        var acceptedAnswers = [];
        for (var key in volumes) {
            prompt += volumes[key].name + ": " + volumes[key].code + ", ";
            acceptedAnswers.push(volumes[key].code);
        }
        prompt += ") ";
        choice = ask(prompt, acceptedAnswers);
    } else {
        choice = config.defaultVolume;
    }
    return choice;
}

exports.location = function () {
    return config.defaultLocation;
}

exports.size = function() {
    var xDim = askNumber('What is the measurement on X ?');
	var yDim = askNumber('What is the measurement on Y ?');
    var zDim = askNumber('What is the measurement on Z ?');
    return [xDim, yDim, zDim];
}

exports.continue = function () {
    var choice = "";
    if (config.askToContinue) {
        var prompt = "Would you like to do an other measure ? (Y / N)";
        choice = ask(prompt, ["Y", "N"]);
    } else {
        choice = config.defaultContinue;
    }
    return choice;
}

exports.measure = function () {
    question("Press ENTER to measure\n");
}

function ask(prompt, accepted) {
    var input = "";
    do {
        input = question("\n" + prompt + "\n  >> ");
        if (!accepted.includes(input))
            console.log('  ...I did not catch that :/');
    } while (!accepted.includes(input));
    return input;
}

function askNumber(prompt) {
    var input = "";
    do {
        input = question("\n" + prompt + "\n  >> ");
        if (isNaN(parseFloat(input)))
            console.log('  ...I did not catch that :/');
    } while (isNaN(parseFloat(input)));
    return parseFloat(input);
}