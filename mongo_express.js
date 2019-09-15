const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://root:root@cluster-ftk2b.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const mongoose = require('mongoose');
mongoose.connect(uri, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const app = express();


app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.urlencoded());


const Disciplina = require('./models/Diciplina')
const Aluno = require('./models/Aluno')

const listFunction = {
    diableChecBox:async function(disciplina, aluno){
        if(aluno.isNew()){
            return false
        }else{
            if(new Date(aluno.updatedAt) > new Date(disciplina.updatedAt)){
                    return  true
            }
        }
    },

    hasConlit: async function(disciplinas){

        if(disciplinas.length == 1){
                return false;
        };
        var auxDisc = {}
        auxDisc.concat({},disciplinas);
        for (let index = 0; index < disciplinas.length; index++) {
            const disciplina = disciplinas[index];
            for (let indexsub = index+1; indexsub < auxDisc.length; indexsub++) {
                const disc = auxDisc[index];
                disciplina.horarios.forEach(horario => {
                    if(disc.horarios.includes(horario)){
                        return true;
                    }
                });
            }            
        }
    }
}



app.get("/", async function (req, res) {

    let disciplina = await Disciplina.find();
    res.render("home", { title: "Home", contador: disciplina.length });

});



app.get("/cadastroAluno", async function (req, res) {

    let alunos = await Aluno.find();
    res.render("aluno", { title: "aluno", lista: alunos });

});


app.get("/cadastroDisciplina", async function (req, res) {

    let disciplina = await Disciplina.find();
    res.render("diciplina", { title: "Disciplina", lista: disciplina });
});




app.get("/register", async function (req, res) {
    //Este handler serve para registar um novo aluno.
    //Desta forma, passamos um objeto aluno vazio para
    //a view.
    let disciplina = await Disciplina.find();
    let aluno = new Aluno();
    res.render("register",
        {
            title: "Novo aluno",
            aluno: aluno,
            disciplina: disciplina,
            functions:  listFunction
        });
});

app.get("/register/:matricula", async function (req, res) {
    //Este handler serve para alterar um aluno, e recebe
    //a matrícula como parâmetro. É feita uma consulta no banco
    //e, caso não encontre aluno com essa matrícula, retorna
    //erro 404. Senão, retorna a view passando o aluno 
    //encontrado
    let aluno = await Aluno.findOne({ matricula: req.params.matricula })
    let disciplina = await Disciplina.find();
    res.render("register", {
        title: "Alterar aluno",
        aluno: aluno,
        disciplina: disciplina,
        functions:  listFunction
    });
});

app.post("/register/:matricula?", async function (req, res) {
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
      

        if (!req.body.nome || !req.body.matricula || req.body.checkDisciplina.length == 0) {
            res.sendStatus(400);
            return
        }
        let disciplinas = await Disciplina.find({ codigo: req.body.checkDisciplina });
        let aluno = await Aluno.create({nome: req.body.nome, matricula: req.body.matricula, disciplinas:disciplinas});


        res.redirect("/");
    }
    else {
        // var aluno = await Aluno.findOne({ matricula: req.params.matricula }).populate('disciplinas')
        if (!req.body.nome || req.body.checkDisciplina.length == 0) {
            //Se não recebemos um nome, retorna erro 400
            res.status({ error: 'Variavel nao condigente com as regras' }).send(400);
            console.log("Nome não informado...")
            return;
        }
        var disciplinas = await Disciplina.find({ codigo: req.body.checkDisciplina })

        var aluno = await Aluno.findOneAndUpdate({matricula:req.params.matricula},
            {
                nome: req.body.nome,
                disciplinas:disciplinas

            }, {new: true})

        // aluno.disciplinas.forEach(disciplina => {
        //     disciplina.horarios.forEach(horario => {
        //         for (let index = 0; index < disciplinas.length; index++) {
        //             if (disciplinas[index].horarios.includes(horario)) {
        //                 res.status({ error: 'ocorreu conflito de materia' }).send(400);
        //             }
        //         }
        //     });
        // });

        //Realiza o UPDATE no banco.
        console.log("update...")
        res.redirect("/");
    }
});







app.get("/register-disciplina", async function (req, res) {
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


app.get("/register-disciplina/:codigo", async function (req, res) {
    //Este handler serve para alterar um aluno, e recebe
    //a matrícula como parâmetro. É feita uma consulta no banco
    //e, caso não encontre aluno com essa matrícula, retorna
    //erro 404. Senão, retorna a view passando o aluno 
    //encontrado


    let disciplina = await Disciplina.findOne({ 'codigo': req.params.codigo });
    if (!disciplina) {
        res.sendStatus(404);
    } else {
        res.render("registerDiciplina", {
            title: "Alterar disciplina",
            disciplina: disciplina
        });
    }
});


//ok
app.post("/register-disciplina/:codigo?", async function (req, res) {
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

    if (!req.params.codigo) {
        body = req.body
        let disciplina = new Disciplina({ ...body });

        if (!disciplina.nome || !disciplina.codigo || disciplina.horarios.length == 0 || disciplina.horarios.length >= 5) {
            res.body = disciplina;
            res.sendStatus(400);
            return;
        }
        disciplina.save()
        res.redirect("/");
    }
    else {

        let disciplinaUp = req.body
        if (!disciplinaUp.nome || disciplinaUp.horarios.length == 0 || disciplinaUp.horarios.length >= 5) {
            //Se não recebemos um nome, retorna erro 400
            res.sendStatus(400);
            console.log(" não informado...")
            return;
        }

        //Realiza o UPDATE no banco.
        await Disciplina.findOneAndUpdate({ codigo: req.params.codigo },
            {
                nome: disciplinaUp.nome,
                horarios: disciplinaUp.horarios
            });
        res.redirect("/");
    }
});

client.connect(function (err, db) {

    app.listen(8080, function () {

        console.log("Server running! Press CTRL+C to close");

    });

});