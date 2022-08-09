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
        default: "Pending"
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
    },
    fileId: [{
        type: String
    }],
    urls: [{
        type: String
    }],
    modifiedUrls: [{
        type: String
    }]
},{ 
    timestamps: true
})

const Ticket = mongoose.model('Ticket', ticketSchema)
module.exports = Ticket