const express = require("express");
const mysql  = require("mysql2/promise");
const { createServer } = require('http');
const { db } = require('../database/config');
const cors = require('cors')

class Server {
    constructor(){
      this.app = express();
      this.port = process.env.PORT;
      this.server = createServer( this.app );
      /* cors */
      this.app.use(cors())
      this.app.use(express.json())
      this.paths = {
          units: '/api/units'
      }
      // Conectar a base de datos
      this.conectarDB();
      // Rutas de mi aplicación
      this.routes();
    }
  
    async conectarDB() {
      await db.promise().query("SELECT NOW()").then(([rows, fields]) => {
        //console.log(rows);
      })
      .catch(console.log());
    }
  
    routes(){
      this.app.use( this.paths.units, require('../routes/units'));
    }
  
    listen(){
      this.server.listen(this.port, () =>{
          console.log(`Example app listening at http://localhost:${this.port}`);
      });
    }
  
  }
  module.exports = Server;