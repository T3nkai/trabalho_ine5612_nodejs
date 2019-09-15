const mongoose = require('mongoose');


var AlunoSchema = new mongoose.Schema({
    matricula: {
        type: String,
        unique: true
    },
    nome: {
        type: String,
        required: true
    },
    disciplinas: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Diciplina'
        }],
        required: true
    },
},
    {
        timestamps: true
    });



const Aluno = mongoose.model('Aluno', AlunoSchema);

module.exports = Aluno;
