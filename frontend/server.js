const express = require('express');
const server = express();

server.use(express.static('public'));

server.use(express.urlencoded({ extended:true }));
require('dotenv/config');

const Pool = require('pg').Pool
const db = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const nunjucks = require('nunjucks');

nunjucks.configure("./public/public_html", {
    express: server,
    noCache: true
});

server.get('/', function(req, res) {
    db.query("SELECT * FROM donors", function(err, result){
        if (err) return res.send(err);

        const donors = result.rows
        return res.render("index.html", { donors });
    })
})

server.post('/', function( req, res){
    const name = req.body.name;
    const email = req.body.email;
    const tel = req.body.phone;
    const blood = req.body.blood;

    if (name == "" || email == "" || tel == "" || blood == "") {
        return res.send("Todos os campos são obrigatórios.");
    }

    const query = `
    INSERT INTO donors ("name", "email","phone", "blood") 
    VALUES ($1, $2, $3,$4)`;

    const values = [name, email,tel, blood];

    db.query(query, values, function(err) {
        if (err) {
            console.log(err)
              return res.send("erro no banco de dados.")
            }

        return res.redirect("/")
    });    
})

server.listen(3000, function() {
    console.log("Oi")
})