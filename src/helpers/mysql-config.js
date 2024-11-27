const mysql = require('mysql2/promise')
require('dotenv').config()
const pool= mysql.createPool({
    host:process.env.DBHOST,
    user:process.env.DBUSER,
    password:process.env.DBPASS,
    port:process.env.DBPORT,
    database:process.env.DBNAME,
    connectionLimit:20,
    queueLimit: 0        // Sin límite para peticiones en espera
})

module.exports=pool