
const mysql = require('mysql2');

const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.PASSWORD,
    port: process.env.DBPORT,
    database: process.env.DATABASE
});
console.log(process.env.DBUSER);

          
db.on("connection", () => console.log("DB Connected!!!!!!!"));

module.exports = {
  db
}