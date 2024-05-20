const mysql2 = require('mysql2');
let mysqlconnection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'rudimentary_cms'
});

mysqlconnection.connect((err) => {
    if (!err) {
        console.log('Connected with Database Successfully!');
    } else {
        console.log('Connection Failed with Database!');
    }
});

module.exports = mysqlconnection;