const mongoose = require('mongoose')    

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    }, 
    status: {
        type: String,
    }, 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    assignedto: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},{ 
    timestamps: true
})

const Ticket = mongoose.model('Ticket', ticketSchema)
module.exports = Ticket