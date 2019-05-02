/////////////////////////////////////////////////////////
//INITIALISATION//
/////////////////////////////////////////////////////////

var five = require("johnny-five");
var board = new five.Board();
var readline = require('readline-sync');
var mysql = require('mysql');
var printf = require('printf');
var { Pool, Client } = require('pg');

const NB_MESURE = 1000;  //Nb de mesures à réaliser par chaque capteur
const INTERVALLE_MESURE = 2; // ^^^ Intervalle de chaque mesure d'un capteur ^^^


/////////////////////////////////////////////////////////
//BOOT-UP//
/////////////////////////////////////////////////////////

console.log('_____________________________________________________________\n');
console.log('\n|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||');
console.log('        ======== La Dimensionneuse - v1.0.0 ========');
console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\n');


/////////////////////////////////////////////////////////
//AUTO OR MANUAL//
/////////////////////////////////////////////////////////

var choix = '';
console.log('_____________________________________________________________\n');
console.log('Hello and welcome !\n');
main();

function main(){
  choix = ask('Would you like to use the scanner mode ? (Y / N) ', ['Y', 'N']);
  if(choix == 'Y'){
    auto();
  }else if (choix == 'N'){
    manual();
  }
}

function auto() {
  console.log('\t\n*** The scanner WILL BE used. ***\n');
  console.log('_____________________________________________________________\n');

  var material = ask('\t\n What type of material is being scanned ? \n (Chene = CHE, Bouleau = BOU, Etre = ETR, MDF = MDF, Sapin = SAP) ',
                     ['CHE', 'BOU', 'ETR', 'MDF', 'SAP']);
  var volume = ask('\t\n What type of volume is being scanned ? \n (Planche = PLAN, Plaque = PLAQ, Tasseau = TASS) ',
                     ['PLAN', 'PLAQ', 'TASS']);
  var stock = ask('\t\n Where is the material being scanned ? \n (At Re-Store = RS, at WoMa = WM)',
                     ['RS', 'WM']);

  console.log('_____________________________________________________________\n');

  board.on('ready',
      function () {
          console.log('\nBOARD READY');

          var button = new five.Button(2);
          var proximityX = new five.Proximity({
              controller: "GP2Y0A710K0F",
              pin: "A0"
          });

          // var proximityY = new five.Proximity({
          //     controller: "GP2Y0A710K0F",
          //     pin: "A1"
          // });
          // var proximityZ = new five.Proximity({
          //     controller: "GP2Y0A710K0F",
          //     pin: "A2"
          // });
          /**
           * Ces controllers ne sont pas utilisés pour le moment, mais ils le seront plus tard
           */
          button.on("press",
              function () {
                  console.log("Measure...");
                  demarrerMesure([proximityX, proximityX, proximityX]);
                  /**
                   * Plus tard on aura -> demarrerMesure([proximityX, proximityY, proximityZ]);
                   */
              }
          );
      }
  );
}

function manual() {
  console.log('\t\n*** The scanner WILL NOT BE used. ***\n');
  console.log('_____________________________________________________________');

  var material = ask('\t\n What type of material is being scanned ? \n (Chene = CHE, Bouleau = BOU, Etre = ETR, MDF = MDF, Sapin = SAP) ',
                     ['CHE', 'BOU', 'ETR', 'MDF', 'SAP']);
  var volume = ask('\t\n What type of volume is being scanned ? \n (Planche = PLAN, Plaque = PLAQ, Tasseau = TASS) ',
                     ['PLAN', 'PLAQ', 'TASS']);
  var stock = ask('\t\n Where is the material being scanned ? \n (At Re-Store = RS, at WoMa = WM)',
                     ['RS', 'WM']);

  console.log('_____________________________________________________________\n');

  var xDim = readline.question('What is the measurement on X ? ');
  var yDim = readline.question('What is the measurement on Y ? ');
  var zDim = readline.question('What is the measurement on Z ? ');

  console.log('_____________________________________________________________\n');

  uploadDb([xDim, yDim, zDim], material, volume, stock);
}


///////////////////////////////////////////////////
//FUNCTIONS FOR AUTO MEASURES//
///////////////////////////////////////////////////

function demarrerMesure(capteurs) {
    /**
     * Réalise la moyenne de NB_MESURE, pour chaque mesure durant INTERVALLE_MESURE ms.
     */
    var total = [0, 0, 0];
    var nbMesures = 0;

    var mesure_intervalle = setInterval(() => {
        var mesure = [capteurs[0].cm, capteurs[1].cm, capteurs[2].cm];
        total = addVector3(total, mesure);

        nbMesures++;
        // Si on a fait NB_MESURE
        if (nbMesures == NB_MESURE) {
            clearInterval(mesure_intervalle);
            finMesure(divVector3(total, nbMesures));
        }
    }, INTERVALLE_MESURE);
}

function finMesure(mesure) {
    console.log("Measure :");
    console.log("\tx : " + mesure[0] + " cm");
    console.log("\ty : " + mesure[1] + " cm");
    console.log("\tz : " + mesure[2] + " cm");

    uploadDb(mesure, material, volume, stock);
}


///////////////////////////////////////////////////
//FUNCTIONS FOR UPLOAD DB MYSQL//
///////////////////////////////////////////////////

// function uploadDb(mesure, material, volume, stock) {
//
//     //Connection (set it up with your own server)
//     var con = mysql.createConnection({
//         host: "localhost",
//         user: "Dimn",
//         password: "Mvtmjs1n",
//         database: "Dimn"
//     });
//
//     //Insert data
//     con.connect(function(err) {
//       if (err) throw err;
//       console.log("_____________________________________________________________\n");
//       var sql = "INSERT INTO prototest (x, y, z, material, type, location) VALUES ?";
//       var values = [
//         [mesure[0], mesure[1], mesure[2], material, volume, stock]
//       ];
//       con.query(sql, [values], function (err, result) {
//         if (err) throw err;
//         else console.log("Connected to MySql | New item inserted in DB | " + result.affectedRows);
//         afterUpload();
//       });
//     });
// }


///////////////////////////////////////////////////
//FUNCTIONS FOR UPLOAD DB POSTGRESQL//
///////////////////////////////////////////////////

function uploadDb(mesure, material, volume, stock) {

  // Connection (set it up with your own server)
  var client = new Client({
    user: 'dimn',
    host: '192.168.1.107',
    database: 'dimn',
    password: 'Mvtmjs1n',
    port: 5432,
  })

  client.connect()
  console.log('Connecté');


  //Insert data
  var text = 'INSERT INTO prototest(x, y, z, material, type, location) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
  var values = [mesure[0], mesure[1], mesure[2], material, volume, stock]

  client.query(text, values, (err, res) => {
    if (err) {
      console.log(err.stack)
    } else {
      console.log(res.rows[0])
      // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    }
  })
}

///////////////////////////////////////////////////
//UTIL FUNCTIONS//
///////////////////////////////////////////////////

function addVector3(a, b) {
    /**
     * Renvoie la somme des tableaux a et b.
     */
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function divVector3(a, m) {
    /**
     * Renvoie la division du tableau a par m.
     */
    return [a[0] / m, a[1] / m, a[2] / m];
}

function ask(prompt, accepted) {
    var input = "";
    do {
        input = readline.question(prompt);
        if (!accepted.includes(input))
            console.log('\tI did not catch that :/')
    } while (!accepted.includes(input));
    return input
}

function afterUpload(){
  var continueMeasure = ask('Would you like to do an other measure ? (Y / N)', ['Y', 'N']);
  if (continueMeasure == 'Y'){
    main();
  }else if (continueMeasure == 'N'){
    process.exit(0);
}}
