const mongoose = require('mongoose');



const DisciplinaSchema = new mongoose.Schema({
    codigo: {
        type: String,
        unique: true,
        required: true
    },
    nome: {
        type: String,
        required: true
    },
    horarios: {
        type: [String],
        required: true
    },
},
    {
        timestamps: true
    });


const Diciplina = mongoose.model('Diciplina', DisciplinaSchema);

module.exports = Diciplina;