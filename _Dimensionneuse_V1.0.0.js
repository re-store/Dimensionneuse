/////////////////////////////////////////////////////////
//NPM PACKAGES AND PREREQUISITES//
/////////////////////////////////////////////////////////


var readline = require('readline-sync');

//JOHNNY-FIVE IS A LIBRARY OF APIs FOR YOU TO USE SENSORS
var five = require("johnny-five");

//THIS IS ONLY IF YOU USE MYSQL FOR YOUR DATABASE
var mysql = require('mysql');

//THIS IS ONLY IF YOU USE POSTGRESQL FOR YOUR DATABASE
var { Pool, Client } = require('pg');



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


var choice = '';
console.log('_____________________________________________________________\n');
console.log('Hello and welcome !\n');
main();


//THERE ARE TWO DIFFERENT MODES FOR YOU TO SCAN YOUR OBJECT; A MANUAL MODE OR AUTOMATIC MODE
function main(){
  choice = ask('Would you like to use the scanner mode ? (Y / N) ', ['Y', 'N']);
  if(choice == 'Y'){
    auto();
  }else if (choice == 'N'){
    manual();
  }
}


//THIS IS THE AUTOMATIC MODE, USING SENSORS TO DETERMINE ONE OBJECT'S DIMENSIONS
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


  //THIS IS THE JOHNNY-FIVE CODE SECTION
  var board = new five.Board();

  board.on('ready',
      function () {
          console.log('\nBOARD READY');

          //THIS IS FOR JOHNNY FIVE TO RECOGNIZE A BUTTON ON PIN 2 (on an arduino)
          var button = new five.Button(2);

          //THIS IS FOR JOHNNY FIVE TO RECOGNIZE A GP2Y0A710K0F SENSOR ON PIN A0 (on an arduino)
          var proximityX = new five.Proximity({
              //HERE, PUT THE SENSOR YOU ARE USING AND ITS PIN (see all supported sensors here: http://johnny-five.io/api/proximity/)
              controller: "GP2Y0A710K0F",
              pin: "A0"
          });


          var proximityY = new five.Proximity({
              controller: "GP2Y0A710K0F",
              pin: "A1"
          });


          var proximityZ = new five.Proximity({
              controller: "GP2Y0A710K0F",
              pin: "A2"
          });


          button.on("press",
              function () {
                  console.log("Measure...");
                  startMeasuring([proximityX, proximityY, proximityZ]);
              }
          );
      }
  );
}


//THIS IS THE MANUAL MODE, ENABLING YOU TO MEASURE AN OBJECT MANUALLY WITH BETTER PRECISION
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


const NB_MEASURE = 1000;  //Nb of measure to be done by each sensor
const MASURE_INTERVAL = 2; // ^^^ Interval between each measure done by sensor ^^^


function startMeasuring(sensors) {

    //Compute the average for NB_MEASURE, for each measure during MEASURE_INTERVAL ms.
    var total = [0, 0, 0];
    var nbMeasures = 0;

    var measure_interval = setInterval(() => {
        var measure = [sensors[0].cm, sensors[1].cm, sensors[2].cm];
        total = addVector3(total, measure);

        nbMeasures++;

        if (nbMeasures == NB_MEASURE) {
            clearInterval(measure_interval);
            endMeasure(divVector3(total, nbMeasures));
        }
    }, MEASURE_INTERVAL);
}


function endMeasure(measure) {
    console.log("Measure :");
    console.log("\tx : " + measure[0] + " cm");
    console.log("\ty : " + measure[1] + " cm");
    console.log("\tz : " + measure[2] + " cm");

    uploadDb(measure, material, volume, stock);
}



///////////////////////////////////////////////////
//FUNCTIONS FOR UPLOAD DB MYSQL//
///////////////////////////////////////////////////


// function uploadDb(measure, material, volume, stock) {
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
//         [measure[0], measure[1], measure[2], material, volume, stock]
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


function uploadDb(measure, material, volume, stock) {

  // Connection (set it up with your own server)
  var client = new Client({
    user: 'dimn',
    host: '192.168.1.107',
    database: 'dimn',
    password: 'Mvtmjs1n',
    port: 5432,
  })

  client.connect()

  //Insert data
  var text = 'INSERT INTO prototest(x, y, z, material, type, location) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
  var values = [measure[0], measure[1], measure[2], material, volume, stock]

  client.query(text, values, (err, res) => {
    if (err) {
      console.log('\nTHE CLIENT DID NOT MANNAGE TO CONNECT ITSELF TO THE SERVER / OR / THERE IS A MISTAKE IN THE CLIENT QUERY\n');
      console.log(err.stack)
    } else {
      console.log(res.rows[0])
      afterUpload();
    }
  })
}



///////////////////////////////////////////////////
//UTIL FUNCTIONS//
///////////////////////////////////////////////////


function addVector3(a, b) {
    //Sends back the sum of tables a and b
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}


function divVector3(a, m) {
    //sends back the division of table a by table m
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
