var mysql = require('mysql');

var connect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eoffice"
});

connect.connect(function(err) {
    if (err) throw err;
    console.log("Connection Success!");
});

module.exports = connect;