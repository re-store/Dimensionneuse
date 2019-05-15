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

  var material = ask('\t\n What type of material is being scanned ? \n (Unknown = UKN, Fir = FIR, Pine = PIN, Birch = BIR \n Spruce = SPR, Larch = LAR, Douglas = DOU \n Walnut = WAL, Oak = OAK, Ash = ASH \n Poplar = POP, Alder = ALD, Teak = TEK \n Elm = ELM, Acacia = ACA, Dark acacia = DAC \n Wenge = WEN, Azobe = AZO)',
                     ['UKN', 'FIR', 'PIN', 'BIR', 'SPR', 'LAR', 'DOU', 'WAL', 'OAK', 'ASH', 'POP', 'ALD', 'TEK', 'ELM', 'ACA', 'DAC', 'WEN', 'AZO']);
  var volume = ask('\t\n What type of volume is being scanned ? \n (Plank = PLAN, Plate = PLAT, Cleat = CLEAT, Undefined = UNDEF) ',
                     ['PLAN', 'PLAT', 'CLEAT', 'UNDEF']);
  var stock = ask('\t\n Where is the material being scanned ? \n (At Re-Store = RS, at WoMa = WM)',
                     ['RS', 'WM']);

  console.log('_____________________________________________________________\n');


  //THIS IS THE JOHNNY-FIVE CODE SECTION
  var board = new five.Board();

  board.on('ready',
      function () {
          console.log('\nBOARD READY');

          //THIS IS FOR JOHNNY FIVE TO RECOGNIZE A BUTTON ON PIN 2 (on an arduino); (You may change "2" to the pin of your choice)
          var button = new five.Button("2");

          //THIS IS FOR JOHNNY FIVE TO RECOGNIZE A GP2Y0A710K0F SENSOR ON PIN A0 (on an arduino);
              //HERE, PUT THE SENSOR YOU ARE USING AND ITS PIN (see all supported sensors here: http://johnny-five.io/api/proximity/)
          var proximityY = new five.Proximity({
              controller: "HCSR04", //(You may change "HCSR04" to the sensor of your choice)
              pin: "7" //(You may change "7" to the pin of your choice)
          });


          var proximityY = new five.Proximity({
              controller: "HCSR04",
              pin: "8"
          });


          var proximityZ = new five.Proximity({
              controller: "GP2Y0A21YK",
              pin: "A0"
          });

          var X = 248.1; //cm
          var Y = 123.3; //cm
          var Z = 28.6; //cm

          button.on("press",
              function () {
                  console.log("Measure...");
                  startMeasuring([proximityX, proximityX, proximityX], [-X, -Y, -Z]);
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
const MEASURE_INTERVAL = 2; // ^^^ Interval between each measure done by sensor ^^^


function startMeasuring(sensors, offset) {

    //Compute the average for NB_MEASURE, for each measure during MEASURE_INTERVAL ms.
    var total = [0, 0, 0];
    var nbMeasures = 0;

    var measure_interval = setInterval(() => {
        var measure = [sensors[0].cm, sensors[1].cm, sensors[2].cm];
        total = addVector3(total, measure);

        nbMeasures++;

        if (nbMeasures == NB_MEASURE) {
            clearInterval(measure_interval);
            var measureDone = divVector3(total, nbMeasures);
            measureDone = addVector3(measureDone, offset);
            endMeasure : endMeasure(measureDone);
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
//     //Connection (set it up with your own server; here we are on localhost; feel free to look at NPM MySQL documentation of you are looking for more connection options)
//     var con = mysql.createConnection({
//         host: "localhost", //The IP adress of your server OR link
//         user: "Dimn", //You user name
//         password: "aPassword", //The password to access your server
//         database: "Dimn" //The name of the database on your server (mine is the same than the user id, but it ussually is different)
//     });
//
//     //Insert data
//     con.connect(function(err) {
//       if (err) throw err;
//       console.log("_____________________________________________________________\n");
//       var sql = "INSERT INTO prototest (x, y, z, material, type, location) VALUES ?"; //Here, it's 'INSERT INTO yourTable (columnName1, columnName2, columnName3...) VALUES ?";
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
    user: 'dimn',  //You user name
    host: '192.168.1.107', //The IP adress of your server OR link
    database: 'dimn', //The name of the database on your server (mine is the same than the user id, but it ussually is different)
    password: 'aPassword', //The password to access your server
    port: 5432, //Your oppened port (it is usually 5433)
  })

  client.connect()

  //Insert data
  var text = 'INSERT INTO prototest(x, y, z, material, type, location) VALUES($1, $2, $3, $4, $5, $6) RETURNING *' //Here, it's 'INSERT INTO yourTable (columnName1, columnName2, columnName3...) VALUES($1, $2, $3...) RETURNING *'
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
