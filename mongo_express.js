const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://root:root@cluster-ftk2b.mongodb.net/test?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');

const expressLayouts = require('express-ejs-layouts');

var app = express();

app.set('view engine', 'ejs');

app.use(expressLayouts);

app.use(express.urlencoded());

 

const port = 80

 

app.get("/", function(req, res) {

    client

        .db("ine5612")

        .collection("alunos")

        .find({})

        .toArray(function (err, alunos) {

            res.render("home", {title: "Home", lista: alunos});

        });

});

 
app.get("/register", function(req, res) {

    res.render("register", {title: "Novo aluno"});

});
app.post("/register", function(req, res) {

    var nome = req.body.nome;

    var matricula = req.body.matricula;

    if (!nome || !matricula) {

        res.redirect("/register");

        return;

    }

    client

        .db("ine5612")

        .collection("alunos")

        .insertOne({nome: nome, matricula: matricula});

    res.redirect("/");

}); 

 
app.get("/register-diciplina", function(req, res) {

    res.render("registerDiciplina", {title: "Nova diciplina"});

});
app.post("/register-diciplina", function(req, res) {

    var nome = req.body.nome;

    var codigo = req.body.codigo;

    var grade = req.body.grade;
    

    if (!nome || !codigo || grade.length == 0 || grade.length >= 5) {

        res.redirect("/register-diciplina");

        return;

    }

    client

        .db("ine5612")

        .collection("diciplina")

        .insertOne({nome: nome, codigo: codigo, grade: grade});

    res.redirect("/");

}); 





client.connect(function(err, db) {

    app.listen(port, function () {

        console.log("Server running! Press CTRL+C to close");

    });

});