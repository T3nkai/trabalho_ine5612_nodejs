const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://root:root@cluster-ftk2b.mongodb.net/test?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express');

const expressLayouts = require('express-ejs-layouts');

const bodyParser = require('body-parser');

var app = express();

app.set('view engine', 'ejs');

app.use(expressLayouts);

app.use(express.urlencoded());

// app.use(express.urlencoded({extended: true})); 
// app.use(express.json());   

// const Schema = MongoClient.Schema;

// const alunoSchema = Schema({
//   _id: Schema.Types.ObjectId,
//   nome: String,
//   matricula: Number,
//   disciplina: [{ type: Schema.Types.ObjectId, ref: 'diciplina' }]
// });

// const diciplinaSchema = Schema({
//     _id: Schema.Types.ObjectId,
//     nome: String,
//     matricula: Number,
//     horarios: Array,
// });

// const Diciplina = mongoose.model('diciplina', alunoSchema);
// const Aluno = mongoose.model('Person', alunoSchema);

const port = 8080;
const dbName = "ine5612";

app.get("/", function (req, res) {
    client
        .db(dbName)
        .collection("disciplina")
        .find({})
        .toArray(function (err, disciplina) {
            res.render("home", { title: "Home", contador: disciplina.length });
        });
});



app.get("/cadastroAluno", function (req, res) {

    var testeDiciplina = {};
    client
        .db(dbName)
        .collection("alunos")
        .find({})
        .toArray()
        .then(function (alunos) {
            TesteAluno = alunos;
            res.render("aluno", { title: "aluno", lista: TesteAluno });

        });

         

        
});


app.get("/cadastroDisciplina", function (req, res) {
    client
        .db(dbName)
        .collection("disciplina")
        .find({})
        .toArray(function (err, disciplina) {
            res.render("diciplina", { title: "Disciplina", lista: disciplina });
        });
});





app.get("/register", function (req, res) {
    //Este handler serve para registar um novo aluno.
    //Desta forma, passamos um objeto aluno vazio para
    //a view.



    //TESTE PARA CARREGAR DOIS OBJETO DO BANCO AQUI 
    // var TesteAluno = {};
    // var testeDiciplina = {};
    // client
    //     .db(dbName)
    //     .collection("alunos")
    //     .find({})
    //     .toArray()
    //     .then(function (alunos) {
    //         TesteAluno = alunos;
    //       client
    //     .db(dbName)
    //     .collection("disciplina")
    //     .find({})
    //     .toArray()
    //     .then(function ( disciplina) {
    //        testeDiciplina = disciplina;
    //        console.log(TesteAluno)
    //        console.log(testeDiciplina)

        
    //         res.render("aluno", { title: "aluno", lista: TesteAluno });

    //     });
        
    //     });

    res.render("register", {
        title: "Novo aluno",
        aluno: {}
    });
});

app.get("/register/:matricula", function (req, res) {
    //Este handler serve para alterar um aluno, e recebe
    //a matrícula como parâmetro. É feita uma consulta no banco
    //e, caso não encontre aluno com essa matrícula, retorna
    //erro 404. Senão, retorna a view passando o aluno 
    //encontrado
    client
        .db(dbName)
        .collection("alunos")
        .findOne({ matricula: req.params.matricula })
        .then(function (aluno) {
            if (!aluno)
                res.sendStatus(404);
            else
                res.render("register", {
                    title: "Alterar aluno",
                    aluno: aluno
                });
        });
});

app.post("/register/:matricula?", function (req, res) {
    //Este handler recebe um POST tanto de registro de novo
    //aluno como de alteração de um aluno existente. O ponto
    //de interrogação no parâmetro 'matricula' indica que esse
    //parâmetro não é obrigatório. Se o parâmetro não for recebido,
    //é feito um INSERT com os valores recebidos em req.body.
    //Se o parâmetro for recebido, é feito UPDATE no registro do 
    //banco de dados (apenas o nome pode ser alterado). É importante
    //notar que, neste caso, não é recebido o número da matrícula
    //em req.body, apenas em req.params (veja a view, lá não é definido
    //um campo de matrícula quando é alteração de aluno).
    if (!req.params.matricula) {
        var matricula = req.body.matricula;
        var nome = req.body.nome

        if (!nome || !matricula) {
            res.sendStatus(400);
            return;
        }

        client
            .db(dbName)
            .collection("alunos")
            .insertOne({ nome: nome, matricula: matricula });
        res.redirect("/");
    }
    else {
        var nome = req.body.nome;
        var matricula = req.params.matricula;
        if (!nome) {
            //Se não recebemos um nome, retorna erro 400
            res.sendStatus(400);
            console.log("Nome não informado...")
            return;
        }

        //Realiza o UPDATE no banco.
        console.log("update...")
        client
            .db(dbName)
            .collection("alunos")
            .updateOne(
                {
                    matricula: matricula
                },
                {
                    $set: { nome: nome }
                },
                function (err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    res.redirect("/");
                    return;
                });
    }
});

app.get("/register-disciplina", function (req, res) {
    //Este handler serve para registar um novo aluno.
    //Desta forma, passamos um objeto aluno vazio para
    //a view.
    res.render("registerDiciplina", {
        title: "Novo disciplina",
        disciplina: {
            nome: '',
            codigo: '',
            horarios: []
        }
    });
});


app.get("/register-disciplina/:codigo", function (req, res) {
    //Este handler serve para alterar um aluno, e recebe
    //a matrícula como parâmetro. É feita uma consulta no banco
    //e, caso não encontre aluno com essa matrícula, retorna
    //erro 404. Senão, retorna a view passando o aluno 
    //encontrado
    client
        .db(dbName)
        .collection("disciplina")
        .findOne({ matricula: req.params.matricula })
        .then(function (disciplina) {
            if (!disciplina)
                res.sendStatus(404);
            else
                res.render("registerDiciplina", {
                    title: "Alterar disciplina",
                    disciplina: disciplina
                });
        });
});



app.post("/register-disciplina/:codigo?", function (req, res) {
    //Este handler recebe um POST tanto de registro de novo
    //aluno como de alteração de um aluno existente. O ponto
    //de interrogação no parâmetro 'matricula' indica que esse
    //parâmetro não é obrigatório. Se o parâmetro não for recebido,
    //é feito um INSERT com os valores recebidos em req.body.
    //Se o parâmetro for recebido, é feito UPDATE no registro do 
    //banco de dados (apenas o nome pode ser alterado). É importante
    //notar que, neste caso, não é recebido o número da matrícula
    //em req.body, apenas em req.params (veja a view, lá não é definido
    //um campo de matrícula quando é alteração de aluno).
    var disciplina = {
        nome: undefined,
        codigo: undefined,
        horarios: []

    }

    if (!req.params.codigo) {
        disciplina.codigo = req.body.codigo;
        disciplina.nome = req.body.nome
        disciplina.horarios = req.body.horarios

        if (!disciplina.nome || !disciplina.codigo || disciplina.horarios.length == 0 || disciplina.horarios.length >= 5) {
            res.body = disciplina;
            res.sendStatus(400);
            return;
        }

        client
            .db(dbName)
            .collection("disciplina")
            .insertOne({ nome: disciplina.nome, codigo: disciplina.codigo, horarios: disciplina.horarios });
        res.redirect("/");
    }
    else {
        disciplina.nome = req.body.nome
        disciplina.horarios = req.body.horarios
        disciplina.codigo = req.params.codigo;
        if (!disciplina.nome || disciplina.horarios.length == 0 || disciplina.horarios.length >= 5) {
            //Se não recebemos um nome, retorna erro 400
            res.sendStatus(400);
            console.log(" não informado...")
            return;
        }

        //Realiza o UPDATE no banco.
        console.log("update...")
        client
            .db(dbName)
            .collection("disciplina")
            .updateOne(
                {
                    codigo: disciplina.codigo
                },
                {
                    $set: {
                        nome: disciplina.nome,
                        horarios: disciplina.horarios
                    }
                },
                function (err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }
                    res.redirect("/");
                    return;
                });
    }
});





client.connect(function (err, db) {

    app.listen(port, function () {

        console.log("Server running! Press CTRL+C to close");

    });

});