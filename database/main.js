/**
 * Interface between the node server and the database.
 */
var { Pool, Client } = require('pg');

module.exports = {
    /**
     * Upload a plank to the database.
     * 
     * @param {Array} measure [x, y, z] measure in mm.
     * @param {Array} precision [x, y, z] precision in mm.
     * @param {String} material
     * @param {String} volume 
     * @param {String} location 
     * @returns {Promise} Operation promise.
     */
    upload: function (measure, precision, material, volume, location) {
        return new Promise(function(resolve, reject) {
            
		var client = new Client({
            user: 'dimn',
            host: '127.0.0.1',
            database: 'dimn',
            password: 'Mvtmjs1n',
            port: 5432,
        })

        client.connect()
        console.log("Connected")

        //Insert data
        var text = 'INSERT INTO prototest(x, y, z, material, type, location) VALUES($1, $2, $3, $4, $5, $6) RETURNING *' //Here, it's 'INSERT INTO yourTable (columnName1, columnName2, columnName3...) VALUES($1, $2, $3...) RETURNING *'
        var values = [Number(measure[0]), Number(measure[1]), Number(measure[2]), material, volume, location]

	var result = "";

        client.query(text, values, (err, res) => {
            if (err) {
                reject("Upload failed. (database/main.js)")
            } else {
                resolve("Upload successful.")
            }
        })

        })
    }
};